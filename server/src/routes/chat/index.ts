import { FastifyInstance } from "fastify";
import {
  deleteDocument,
  listUploadedDocuments,
  streamChatWithGemini,
} from "../../services/chat";
// import { ingestFile } from "../../services/helper/ingest.service";
import { retrieveRelevantChunks } from "../../services/helper/retrieval.service";
import { buildRagPrompt } from "../../services/helper/build-rag-prompt.service";
import { ingestionQueue } from "../../services/queues/ingestion.queue";
import { v4 as uuid } from "uuid";
import fs from "fs/promises";
import path from "path";

export default async function (fastify: FastifyInstance) {
  fastify.post("/stream", async (request, reply) => {
    const { message } = request.body as { message?: string };

    if (!message) {
      throw fastify.httpErrors.badRequest("Message is required");
    }

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": fastify.config.CLIENT_URL,
    });

    try {
      const chunks = await retrieveRelevantChunks(message, 3);
      const prompt = buildRagPrompt(message, chunks);
      await streamChatWithGemini(fastify, prompt, (chunk) => {
        reply.raw.write(chunk);
      });
    } catch (err) {
      fastify.log.error(err);
    } finally {
      reply.raw.end();
    }
  });

  fastify.post("/upload", async (request, reply) => {
    const file = await request.file();
    const documentId = uuid();

    if (!file) {
      throw fastify.httpErrors.badRequest("File is required");
    }

    const SHARED_UPLOAD_DIR = path.resolve("uploads"); // project root /uploads
    // Ensure upload directory exists
    await fs.mkdir(SHARED_UPLOAD_DIR, { recursive: true });

    const filePath = path.join(
      SHARED_UPLOAD_DIR,
      `${documentId}-${file.filename}`
    );

    // 🔹 Write file to disk (Node Buffer required here)
    const buffer = await file.toBuffer();
    await fs.writeFile(filePath, buffer);

    // 🔹 Enqueue ONLY metadata + file path
    await ingestionQueue.add(
      "ingest",
      {
        documentId,
        filePath: filePath,
        filename: file.filename,
        mimetype: file.mimetype,
      },
      {
        jobId: documentId,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    reply.code(202).send({
      documentId,
      status: "QUEUED",
    });
  });

  fastify.get("/", async function (request, reply) {
    reply.send({ success: true, data: [] });
  });

  fastify.get("/document", async (request, reply) => {
    try {
      const result = await listUploadedDocuments();
      reply.send({ success: true, data: result[0] || null });
    } catch (error) {
      fastify.log.error(error);
      reply.badRequest("Failed to fetch document");
    }
  });

  fastify.delete("/document/delete/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    console.log(id, "id");

    await deleteDocument(id);

    reply.send({ success: true });
  });

  fastify.get("/document/:id/status", async (req) => {
    const { id } = req.params as { id: string };
    const job = await ingestionQueue.getJob(id);
    if (!job) return { status: "NOT_FOUND" };

    const state = await job.getState();
    console.log(state);

    if (state === "failed") {
      return {
        status: state.toUpperCase(),
        progress: job.progress,
        reason: job.failedReason, // 🔥 show this to user
      };
    }

    return {
      status: state.toUpperCase(), // waiting | active | completed
      progress: job.progress,
    };
  });
}
