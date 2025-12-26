import { DocumentChunk } from "../../types";
import { getCollection } from "./chroma.collection.service";
import embedTexts from "./embedding.service";

export async function retrieveRelevantChunks(
  question: string,
  topK = 3
): Promise<DocumentChunk[]> {
  const collection = await getCollection();
  const [queryEmbedding] = await embedTexts([question], "query", 1);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    include: ["documents", "metadatas"],
  });

  return results.documents[0].map((content, index) => ({
    id: `${index}`, // or a real chunk id if you store it
    content: content ?? "", // 🔥 NORMALIZATION
    source: String(results.metadatas[0][index]?.source ?? ""),
  }));
}
