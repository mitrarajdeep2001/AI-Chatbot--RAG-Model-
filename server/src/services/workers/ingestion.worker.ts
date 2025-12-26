import { Worker } from "bullmq";
import { ingestFile } from "../helper/ingest.service";
import redis from "../helper/redis.service";
import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

export const ingestionWorker = new Worker(
  "document-ingestion",
  async (job) => {
    const { filePath, filename, mimetype, documentId } = job.data;
    try {
      await job.updateProgress(40);

      // 🔹 Read file from shared file path
      const buffer = await fs.readFile(filePath);

      await ingestFile({
        buffer,
        filename,
        mimetype,
        documentId,
        onProgress: (p) => job.updateProgress(p),
      });

      return { status: "DONE" };
    } catch (err) {
      // Attach a human-readable reason
      job.updateProgress(0);
      throw err; // 🔥 REQUIRED so BullMQ marks it as FAILED
    } finally {
      // 🔹 Cleanup: Delete temp file
      try {
        // await fs.unlink(filePath);
      } catch (err) {
        console.error("Failed to delete temp file:", filePath, err);
      }
    }
  },
  { connection: redis }
);
