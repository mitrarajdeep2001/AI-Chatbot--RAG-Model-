import fp from "fastify-plugin";
import { createBullBoard } from "@bull-board/api";
import { FastifyAdapter } from "@bull-board/fastify";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ingestionQueue } from "../services/queues/ingestion.queue";

export default fp(async (fastify) => {
  const serverAdapter = new FastifyAdapter();
  serverAdapter.setBasePath("/admin/queues");

  createBullBoard({
    queues: [new BullMQAdapter(ingestionQueue)],
    serverAdapter,
  });

  fastify.register(serverAdapter.registerPlugin(), {
    prefix: "/admin/queues",
  });
});
