from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from typing import List

app = FastAPI()

# FAST + GOOD (use this first)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# If you want E5 later:
# model = SentenceTransformer("intfloat/multilingual-e5-large")

class EmbedRequest(BaseModel):
    texts: List[str]

@app.post("/embed")
def embed(req: EmbedRequest):
    embeddings = model.encode(
        req.texts,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True
    )
    return embeddings.tolist()
