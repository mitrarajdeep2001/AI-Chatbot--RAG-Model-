import { FastifyInstance } from "fastify";
import { createGeminiClient } from "../helper/gemini.service";
import { getCollection } from "../helper/chroma.collection.service";

export async function streamChatWithGemini(
  fastify: FastifyInstance,
  prompt: string,
  onChunk: (chunk: string) => void
) {
  const genAI = createGeminiClient(fastify);

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });
  const stream = await model.generateContentStream(prompt);

  for await (const chunk of stream.stream) {
    const text = chunk.text();
    if (text) {
      onChunk(text);
    }
  }
}

export async function listUploadedDocuments() {
  const collection = await getCollection();

  const results = await collection.get({
    include: ["metadatas"],
  });

  const documentsMap = new Map<string, string>();

  results.metadatas?.forEach((meta) => {
    if (meta && meta.documentId && meta.source) {
      documentsMap.set(meta.documentId as string, meta.source as string);
    }
  });

  return Array.from(documentsMap.entries()).map(([documentId, source]) => ({
    documentId,
    source,
  }));
}

export async function deleteDocument(documentId: string) {
  const collection = await getCollection();

  await collection.delete({
    where: {
      documentId,
    },
  });
}
