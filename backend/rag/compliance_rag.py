"""Grounded compliance RAG adapter derived from the submitted RAG notebook.

The binary chunk/embedding index is optional at runtime. When it is absent, the
module fails closed instead of inventing compliance facts.
"""
from __future__ import annotations
import json, os, re
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent
CHUNKS_PATH = BASE_DIR / "chunks" / "compliance_chunks.jsonl"
EMBEDDINGS_PATH = BASE_DIR / "embeddings" / "chunk_embeddings.npy"
METADATA_PATH = BASE_DIR / "embeddings" / "chunk_metadata.jsonl"
LOCAL_MODEL_PATH = BASE_DIR / "embedding_model" / "all-MiniLM-L6-v2"

_INDEX = None


def _assets_available() -> bool:
    return CHUNKS_PATH.exists() and EMBEDDINGS_PATH.exists() and METADATA_PATH.exists()


def load_index():
    global _INDEX
    if _INDEX is not None:
        return _INDEX
    if not _assets_available():
        return None
    try:
        import numpy as np
        import pandas as pd
        from sentence_transformers import SentenceTransformer
        chunks = pd.DataFrame([json.loads(x) for x in CHUNKS_PATH.read_text(encoding='utf-8').splitlines() if x.strip()])
        metadata = pd.DataFrame([json.loads(x) for x in METADATA_PATH.read_text(encoding='utf-8').splitlines() if x.strip()])
        embeddings = np.load(EMBEDDINGS_PATH)
        if not (len(chunks) == len(embeddings) == len(metadata)):
            raise ValueError('RAG index alignment error')
        model_path = str(LOCAL_MODEL_PATH) if LOCAL_MODEL_PATH.exists() else 'all-MiniLM-L6-v2'
        model = SentenceTransformer(model_path)
        _INDEX = (chunks, embeddings, metadata, model)
        return _INDEX
    except Exception:
        return None


def search_compliance_docs(query, top_k=4, doc_type_filter=None, similarity_threshold=0.55):
    loaded = load_index()
    if loaded is None:
        return []
    chunks_df, rag_embeddings, rag_metadata, embedding_model = loaded
    import numpy as np
    qv = embedding_model.encode(query, convert_to_numpy=True, normalize_embeddings=True).astype(np.float32)
    if doc_type_filter:
        mask = rag_metadata['doc_type'].astype(str).str.lower() == doc_type_filter.lower()
        candidate_indices = np.where(mask.values)[0]
    else:
        candidate_indices = np.arange(len(rag_metadata))
    if len(candidate_indices) == 0: return []
    semantic_scores = np.dot(rag_embeddings[candidate_indices], qv)
    ql = query.lower()
    query_tokens = set(re.findall(r'[a-zA-Z0-9]+', ql))
    stopwords = {'what','is','are','the','a','an','and','or','of','to','for','how','can','i','my','in','on','with','based','does','do','it'}
    query_tokens = {t for t in query_tokens if t not in stopwords and len(t)>2}
    ranked=[]
    for pos, actual_index in enumerate(candidate_indices):
        semantic_score=float(semantic_scores[pos])
        m=rag_metadata.iloc[actual_index]
        source_text=(str(m.get('source_file',''))+' '+str(m.get('title',''))+' '+str(m.get('doc_type',''))).lower()
        overlap=len(query_tokens.intersection(set(re.findall(r'[a-zA-Z0-9]+',source_text))))
        keyword_bonus=min(overlap*0.02,0.08)
        source_bonus=0.0
        if 'gstr-3b' in ql and 'gstr3b' in source_text: source_bonus+=0.15
        if 'gstr-2b' in ql and 'gstr2b' in source_text: source_bonus+=0.15
        if 'udyam' in ql and 'udyam' in source_text: source_bonus+=0.10
        ranked.append((semantic_score+keyword_bonus+source_bonus, semantic_score, actual_index))
    ranked.sort(reverse=True)
    out=[]
    for hybrid_score, semantic_score, actual_index in ranked:
        if semantic_score < similarity_threshold: continue
        m=rag_metadata.iloc[actual_index].to_dict()
        matching=chunks_df.loc[chunks_df['chunk_id']==m['chunk_id']]
        if matching.empty: continue
        out.append({**m,'similarity_score':round(semantic_score,4),'hybrid_score':round(hybrid_score,4),'text':matching['chunk_text'].iloc[0]})
        if len(out)>=top_k: break
    return out


def extract_udyam_classification(text):
    text = re.sub(r'\s*\.\s*','.',str(text))
    text = re.sub(r'\s+',' ',text).strip()
    patterns = {
        'Micro': r'Micro\s+Enterprise\s*:\s*Investment\s+does\s+not\s+exceed\s+Rs\.?\s*2\.5\s*crore\.?\s*Turnover\s+does\s+not\s+exceed\s+Rs\.?\s*10\s*crore',
        'Small': r'Small\s+Enterprise\s*:\s*Investment\s+does\s+not\s+exceed\s+Rs\.?\s*25\s*crore\.?\s*Turnover\s+does\s+not\s+exceed\s+Rs\.?\s*100\s*crore',
        'Medium': r'Medium\s+Enterprise\s*:\s*Investment\s+does\s+not\s+exceed\s+Rs\.?\s*125\s*crore\.?\s*Turnover\s+does\s+not\s+exceed\s+Rs\.?\s*500\s*crore'
    }
    extracted=[]
    for category, pattern in patterns.items():
        match=re.search(pattern,text,flags=re.I)
        if not match: continue
        block=match.group(0)
        im=re.search(r'Investment\s+does\s+not\s+exceed\s+Rs\.?\s*([\d]+(?:\.[\d]+)?)\s*crore',block,flags=re.I)
        tm=re.search(r'Turnover\s+does\s+not\s+exceed\s+Rs\.?\s*([\d]+(?:\.[\d]+)?)\s*crore',block,flags=re.I)
        if im and tm: extracted.append({'category':category,'investment':im.group(1),'turnover':tm.group(1)})
    return extracted


def generate_compliance_answer(query, top_k=4, doc_type_filter=None, similarity_threshold=0.55):
    results=search_compliance_docs(query,top_k,doc_type_filter,similarity_threshold)
    if not results:
        return {'answer':'I could not verify this from the connected compliance knowledge base.','intent':'COMPLIANCE','sources':[],'confidence':'low','retrieved_chunks':[]}
    top=results[0]
    text=top['text']
    ql=query.lower()
    if 'msme' in ql and any(t in ql for t in ['classification','turnover','investment','micro','small','medium','category','categories','limit','limits']):
        extracted=extract_udyam_classification(text)
        if extracted:
            lines=['According to the connected official Udyam source, MSME classification is based on investment and turnover.']
            for x in extracted: lines.append(f"- {x['category']}: Investment <= Rs. {x['investment']} crore; Turnover <= Rs. {x['turnover']} crore.")
            answer='\n'.join(lines)
        else:
            answer='The relevant Udyam source was retrieved, but the classification criteria could not be cleanly extracted.'
    else:
        clean_text=re.sub(r'\s+',' ',str(text)).strip()
        answer=clean_text[:1000]
    score=float(top['similarity_score'])
    confidence='high' if score>=0.70 else 'medium' if score>=0.60 else 'low'
    sources=[{'label':top.get('title') or top.get('source_file','Compliance source'),'similarity':score,'source_url':top.get('source_url',''),'page_no':top.get('page_no','')}]
    return {'answer':answer,'intent':'COMPLIANCE','sources':sources,'confidence':confidence,'retrieved_chunks':results}
