// const HF_E5_ENDPOINT =
//   "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction";

// async function embedTexts(
//   texts: string[],
//   type: "passage" | "query",
//   batchSize = 2
// ): Promise<number[][]> {
//   const embeddings: number[][] = [];

//   for (let i = 0; i < texts.length; i += batchSize) {
//     const batch = texts
//       .slice(i, i + batchSize)
//       .map((t) => `${type}: ${t.replace(/\s+/g, " ").trim().slice(0, 500)}`);

//     const response = await fetch(HF_E5_ENDPOINT, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.HF_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ inputs: batch }),
//     });

//     if (!response.ok) {
//       const err = await response.text();
//       throw new Error(`HF E5 failed (${response.status}): ${err}`);
//     }

//     const data = (await response.json()) as number[][];

//     embeddings.push(...data);
//   }

//   return embeddings;
// }

// export default embedTexts;

const LOCAL_EMBEDDING_ENDPOINT = "http://localhost:5000/embed";

async function embedTexts(
  texts: string[],
  _type?: "passage" | "query", // kept for compatibility, not used
  batchSize = 32
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts
      .slice(i, i + batchSize)
      .map((t) => t.replace(/\s+/g, " ").trim().slice(0, 1000));

    const response = await fetch(LOCAL_EMBEDDING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts: batch }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(
        `Local embedding service failed (${response.status}): ${err}`
      );
    }

    const data = (await response.json()) as number[][];

    embeddings.push(...data);
  }

  return embeddings;
}

export default embedTexts;
