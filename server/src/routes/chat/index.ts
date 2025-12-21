import { FastifyInstance } from "fastify";
import {
  deleteDocument,
  listUploadedDocuments,
  streamChatWithGemini,
} from "../../services/chat";
import { ingestFile } from "../../services/helper/ingest.service";
import { retrieveRelevantChunks } from "../../services/helper/retrieval.service";
import { buildRagPrompt } from "../../services/helper/build-rag-prompt.service";

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

    if (!file) {
      throw fastify.httpErrors.badRequest("File is required");
    }

    const buffer = new Uint8Array(await file.toBuffer());

    await ingestFile({
      buffer,
      filename: file.filename,
      mimetype: file.mimetype,
    });

    reply.send({ success: true });
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
}
