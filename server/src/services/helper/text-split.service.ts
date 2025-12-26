export default function splitTextIntoChunks(
  text: string,
  chunkSize = 400,
  overlap = 80
): string[] {
  const cleanText = text
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);
    const chunk = cleanText.slice(start, end).trim();

    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}
