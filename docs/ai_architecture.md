# UDYAM AI — AI System Architecture & Model/Data Source Map

## 1. Provider Abstraction Strategy
UDYAM AI uses a **Provider-Agnostic LLM Interface** (`LLMProvider`) allowing seamless hot-swapping between foundation models without code modification.

### Configuration Settings
```env
LLM_PROVIDER=openai # Options: openai, gemini, claude, ollama
MODEL_NAME=gpt-4o   # Options: gpt-4o, gemini-1.5-pro, claude-3-5-sonnet, llama3
```

---

## 2. Model / Data Source Capability Map

| Capability | Engine / Model / API | Data Source | Fine-Tuning Policy | Source of Truth |
| :--- | :--- | :--- | :--- | :--- |
| **Speech-to-Text** | Bhashini / AI4Bharat IndicASR | Audio Stream | No (Use API) | Audio Input |
| **Translation** | IndicTrans2 / Bhashini | Samanantar corpus | No (Use API) | Original Language Text |
| **Document Embedding** | `sentence-transformers/all-MiniLM-L6-v2` | Government Circulars, Schemes | No (Use Pretrained) | Vector Store Metadata |
| **RAG Knowledge System** | Qdrant / pgvector + Hybrid Reranker | GST Acts, Schemes, GeM Manuals | No (Keep in Vector DB) | Official Government PDFs |
| **Numerical Forecasting** | Exponential Smoothing / Prophet / Chronos | Sales & Inventory Registers | No LLM (Use Statistical Engine) | Transaction DB |
| **Financial Ratios** | Deterministic Python Financial Engine | Invoices, Receivables, Payables | No ML | General Ledger |
| **Reconciliation** | Deterministic 3-Way Matching Rules | Bank Statements, Invoices, POs | No ML | Bank & Tax Records |
| **Market Signals** | Trend Matching Pipeline | Google Trends, News RSS | No ML | Public Market APIs |
| **Reasoning & Synthesis** | `LLMProvider` (OpenAI / Gemini / Ollama) | Verified Tool Outputs + System Prompt | Optional LoRA for Hinglish intent | Tool Output JSON |

---

## 3. Grounded Response Enforcer & Guardrails
Every response produced by UDYAM AI MUST pass through the output schema guardrail:

```json
{
  "answer": "Direct clear answer in user's language (English/Hindi/Hinglish)",
  "evidence": [
    "Specific data point 1 from database/tool",
    "Specific clause or regulation from RAG document"
  ],
  "calculations": [
    "Gross Margin = ((Revenue - COGS) / Revenue) * 100",
    "Stockout Days = Current Stock / Daily Velocity"
  ],
  "sources": [
    {
      "title": "GST Circular 183/15/2022",
      "effective_date": "2022-12-27",
      "authority": "CBIC India"
    }
  ],
  "recommendations": [
    "Actionable next step for business owner"
  ],
  "confidence": 0.95,
  "data_freshness": "Updated 2 hours ago",
  "requires_human_review": false
}
```

---

## 4. RAG Knowledge Pipeline Metadata Standards
When indexing government policies, GST circulars, or GeM procurement guidelines into Qdrant/pgvector, every chunk must carry:
```json
{
  "document_id": "GOV-GST-2026-04",
  "title": "Clarification on ITC Reconciliation under GSTR-2B",
  "source": "https://cbic.gov.in/notifications",
  "authority": "Central Board of Indirect Taxes and Customs",
  "publication_date": "2026-01-15",
  "effective_date": "2026-02-01",
  "category": "GST",
  "sector": "All MSME Sectors",
  "jurisdiction": "India",
  "language": "en",
  "last_verified": "2026-09-01",
  "version": "1.2"
}
```
