import { chroma } from "./chroma.client.service";

export async function getCollection() {
  return await chroma.getOrCreateCollection({
    name: "documents_e5",
    metadata: {
      embedding_model: "intfloat/multilingual-e5-large",
      dimension: 1024,
    },
  });
}
