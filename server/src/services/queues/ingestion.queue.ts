import { Queue } from "bullmq";
import redis from "../helper/redis.service";

export const ingestionQueue = new Queue("document-ingestion", {
  connection: redis,
});
