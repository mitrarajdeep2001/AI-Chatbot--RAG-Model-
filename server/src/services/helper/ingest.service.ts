import { PDFParse } from "pdf-parse";
import splitTextIntoChunks from "../helper/text-split.service";
import { embedAndStore } from "../helper/vector-store.service";

interface IngestArgs {
  buffer: Uint8Array;
  filename: string;
  mimetype: string;
  documentId: string;
  onProgress?: (p: number) => void;
}

export async function ingestFile({
  buffer,
  filename,
  mimetype,
  documentId,
  onProgress,
}: IngestArgs) {
  let text = "";

  if (mimetype === "application/pdf") {
    const parser = new PDFParse(new Uint8Array(buffer));
    const parsed = await parser.getText();
    text = parsed.text;
  } else if (mimetype === "text/plain") {
    text = Buffer.from(buffer).toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }

  const chunks = splitTextIntoChunks(text);
  onProgress?.(60);

  await embedAndStore(chunks, filename, documentId, onProgress);
  // await Promise.resolve(
  //   setTimeout(() => {
  //     onProgress?.(100);
  //   }, 2000)
  // );
}
