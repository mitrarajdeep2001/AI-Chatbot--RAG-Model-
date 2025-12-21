import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";
import { envSchema } from "../configs/env.schema";

export default fp(async (fastify) => {
    await fastify.register(fastifyEnv, {
        schema: envSchema,
        dotenv: true
    });
});
