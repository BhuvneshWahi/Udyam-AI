# Compliance RAG

`compliance_rag.py` is derived from the submitted RAG notebook. The original notebook built a local SentenceTransformers index. This repository adapter loads that index only if the chunk/embedding/model assets are present. Otherwise it fails closed with a “could not verify” response.

For a fully offline RAG run, place the original handoff assets under this directory:

- `chunks/compliance_chunks.jsonl`
- `embeddings/chunk_embeddings.npy`
- `embeddings/chunk_metadata.jsonl`
- `embedding_model/all-MiniLM-L6-v2/`
