import { v4 as uuid } from "uuid";
import { getCollection } from "./chroma.collection.service";
import embedTexts from "./embedding.service";

export async function embedAndStore(
  chunks: string[],
  source: string,
  documentId: string,
  onProgress?: (p: number) => void
) {
  const collection = await getCollection();

  // 1️⃣ Batch embeddings (already optimal)
  const embeddings = await embedTexts(chunks, "passage", 32);
  onProgress?.(80);

  // 2️⃣ Batch inserts into Chroma
  const batchSize = 32;
  const total = chunks.length;

  for (let i = 0; i < total; i += batchSize) {
    const chunkBatch = chunks.slice(i, i + batchSize);
    const embeddingBatch = embeddings.slice(i, i + batchSize);

    const ids = chunkBatch.map(() => uuid());
    const metadatas = chunkBatch.map(() => ({
      source,
      documentId,
    }));

    await collection.add({
      ids,
      embeddings: embeddingBatch,
      documents: chunkBatch,
      metadatas,
    });

    // Progress: 80 → 100
    const progress = 80 + Math.round(((i + chunkBatch.length) / total) * 20);
    onProgress?.(progress);
  }
}
