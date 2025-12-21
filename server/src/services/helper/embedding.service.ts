import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_KEY);

export async function embedText(text: string): Promise<number[]> {
  const response = await client.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });

  // HF may return number[] or number[][]
  if (Array.isArray(response[0])) {
    return response[0] as number[];
  }

  return response as number[];
}
