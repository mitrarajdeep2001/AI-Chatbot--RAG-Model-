import { DocumentChunk } from "../../types";

export function buildRagPrompt(
  question: string,
  chunks: DocumentChunk[]
) {
  const context = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.content}\nSource: ${c.source}`
    )
    .join("\n\n");

  return `
Answer the question using ONLY the context below.
If the answer is not in the context, say "I don't know".

Context:
${context}

Question:
${question}
`;
}
