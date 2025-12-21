import { ChromaClient } from "chromadb";

export const chroma = new ChromaClient({
  path: "http://localhost:8000" // or local embedded if using default
});
