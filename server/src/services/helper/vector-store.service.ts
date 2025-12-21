import { v4 as uuid } from "uuid";
import { embedText } from "./embedding.service";
import { getCollection } from "./chroma.collection.service";

export async function embedAndStore(chunks: string[], source: string) {
  const collection = await getCollection();
  const documentId: string = uuid();
  for (const chunk of chunks) {
    const embedding = await embedText(chunk);
    console.log(embedding, chunk, source);

    await collection.add({
      ids: [uuid()],
      embeddings: [embedding],
      documents: [chunk],
      metadatas: [
        {
          source,
          documentId,
        },
      ],
    });
  }
}
