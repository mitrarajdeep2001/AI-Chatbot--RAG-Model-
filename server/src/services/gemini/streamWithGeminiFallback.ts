import { FastifyInstance } from "fastify";
import { createGeminiClient } from "./gemini.service";

const MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

export async function streamWithGeminiFallback(
  fastify: FastifyInstance,
  prompt: string,
  onChunk: (chunk: string) => void
) {
  const genAI = createGeminiClient(fastify);

  let lastError: any;

  for (const modelName of MODELS) {
    try {
      fastify.log.info(`Trying Gemini model: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });
      const stream = await model.generateContentStream(prompt);

      for await (const chunk of stream.stream) {
        const text = chunk.text();
        if (text) onChunk(text);
      }

      // ✅ Success → exit immediately
      return { modelUsed: modelName };
    } catch (err: any) {
      lastError = err;

      if (err.status === 429) {
        fastify.log.warn(`Rate limit hit for ${modelName}, switching model...`);
        continue;
      }

      // Non-rate limit error → abort
      throw err;
    }
  }

  // ❌ All models exhausted
  throw lastError;
}
