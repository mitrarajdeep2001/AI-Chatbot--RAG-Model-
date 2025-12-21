import fp from "fastify-plugin";
import { FastifyError, FastifyInstance } from "fastify";

export default fp(async (fastify: FastifyInstance) => {
    fastify.setErrorHandler((error: FastifyError, request, reply) => {
        const statusCode = error.statusCode ?? 500;

        // Log unexpected errors
        if (statusCode >= 500) {
            fastify.log.error(
                {
                    err: error,
                    url: request.url,
                    method: request.method
                },
                "Unhandled server error"
            );
        }

        reply.status(statusCode).send({
            success: false,
            error: {
                message: error.message,
                statusCode
            }
        });
    });
});
