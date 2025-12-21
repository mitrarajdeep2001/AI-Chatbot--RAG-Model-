import "fastify";
import { EnvConfig } from "../configs/env.schema";

declare module "fastify" {
    interface FastifyInstance {
        config: EnvConfig;
    }
}
