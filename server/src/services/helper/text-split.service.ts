export default function splitTextIntoChunks(
  text: string,
  chunkSize = 800,
  overlap = 150
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }

  return chunks;
}
