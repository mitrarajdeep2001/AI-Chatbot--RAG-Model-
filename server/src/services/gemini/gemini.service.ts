import { GoogleGenerativeAI } from "@google/generative-ai";
import { FastifyInstance } from "fastify";

export function createGeminiClient(fastify: FastifyInstance) {
    return new GoogleGenerativeAI(
        fastify.config.GEMINI_API_KEY
    );
}
