# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import embed_anything
from embed_anything import EmbeddingModel, TextEmbedConfig
import os
import shutil
import numpy as np

app = FastAPI()

# Enable CORS so your Next.js app (on port 3000/3001) can talk to Python (on port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load a lightweight, CPU-optimized model
model = EmbeddingModel.from_pretrained_hf(
    model_id="sentence-transformers/all-MiniLM-L12-v2"
)

# In-memory "Vector Database" for this session
knowledge_base = []

@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    global knowledge_base
    os.makedirs("temp", exist_ok=True)
    
    new_chunks = 0
    for file in files:
        temp_path = f"temp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # EmbedAnything automatically handles PDF, MD, and TXT
        config = TextEmbedConfig(chunk_size=500, splitting_strategy="sentence")
        data = embed_anything.embed_file(temp_path, embedder=model, config=config)
        
        knowledge_base.extend(data)
        new_chunks += len(data)
        os.remove(temp_path)

    return {"status": "success", "message": f"Indexed {new_chunks} segments."}

@app.post("/query")
async def query_system(payload: dict):
    user_query = payload.get("query", "")
    if not knowledge_base:
        return {"results": []}

    # Embed the query using the same model
    query_emb = embed_anything.embed_query([user_query], embedder=model)[0].embedding
    
    # Simple semantic search (Cosine Similarity)
    scored_results = []
    for item in knowledge_base:
        score = np.dot(query_emb, item.embedding)
        scored_results.append({"text": item.text, "score": float(score)})

    # Sort by best match
    scored_results.sort(key=lambda x: x["score"], reverse=True)
    return {"results": scored_results[:4]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)