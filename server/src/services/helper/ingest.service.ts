import { PDFParse } from 'pdf-parse';
import splitTextIntoChunks from "../helper/text-split.service";
import { embedAndStore } from "../helper/vector-store.service";

interface IngestArgs {
  buffer: Uint8Array;
  filename: string;
  mimetype: string;
}

export async function ingestFile({ buffer, filename, mimetype }: IngestArgs) {
  let text = "";

  if (mimetype === "application/pdf") {
    const parser = new PDFParse(buffer)
    const parsed = await parser.getText();
    text = parsed.text;
  } else if (mimetype === "text/plain") {
    text = buffer.toString();
  } else {
    throw new Error("Unsupported file type");
  }

  const chunks = splitTextIntoChunks(text);

  await embedAndStore(chunks, filename);
}
