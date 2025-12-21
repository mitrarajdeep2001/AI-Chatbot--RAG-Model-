import { chroma } from "./chroma.client.service";

export async function getCollection() {
  return await chroma.getOrCreateCollection({
    name: "documents"
  });
}
