# UDYAM AI — System Architecture Specification

## 1. Overview
UDYAM AI is an **AI-powered MSME Decision Intelligence + Compliance + Business Copilot** operating above existing MSME business systems (Tally, Vyapar, Zoho Books, Khatabook, myBillBook, POS systems, ERPs, Bank Account Aggregators, uploaded CSV/Excel/Invoices, and public datasets).

The system explicitly decouples natural language reasoning (LLM) from source-of-truth calculations (financial engines, statistical forecasts, compliance rules tables, deterministic reconciliation).

---

## 2. High-Level System Architecture

```
                    USER
                      |
                      v
              Voice / Web / Chat
                      |
                      v
              QUERY UNDERSTANDING
                      |
                      v
                INTENT ROUTER
                      |
       +--------------+--------------+
       |              |              |
       v              v              v
 Business Data      RAG          Forecasting
 Analytics          Engine       Engine
       |              |              |
       +--------------+--------------+
                      |
                      v
              TOOL / AGENT LAYER
                      |
       +--------------+--------------+
       |              |              |
 Compliance       Market         GeM
 Engine           Intelligence   Intelligence
       |
       +--------------------------------+
                                        |
                                        v
                                REASONING LLM
                                        |
                                        v
                           VALIDATION / GUARDRAILS
                                        |
                                        v
                             STRUCTURED RESPONSE
                                        |
                    +-------------------+------------------+
                    |                   |                  |
                    v                   v                  v
                 Dashboard            Chat              Voice
                  Alerts             Response           Response
```

---

## 3. Layer Breakdown

### A. Interface & Query Understanding
- **Voice System**: Multi-lingual speech transcription via Bhashini / AI4Bharat IndicASR abstractions with Hinglish/Hindi/English fallback.
- **Web App**: SPA built with React, Vite, TypeScript, Tailwind CSS. Responsive shell supporting desktop persistent sidebar & mobile drawer.
- **Intent Router**: Classifies incoming query into business analytics (`SALES`, `INVENTORY`, `FINANCE`), compliance (`GST`, `TAX`), forecasting (`REORDER`), market intelligence (`TRENDS`, `FESTIVALS`), schemes (`GOVT`), or agreement analysis (`CONTRACT`).

### B. Analytical & Retrieval Engines
1. **Business Data Engine**: Normalizes heterogenous incoming data (Tally, Vyapar, CSV, POS) into canonical Pydantic/SQLAlchemy models.
2. **RAG Knowledge System**: Vector DB (Qdrant / pgvector) hybrid retrieval with metadata filters (`document_id`, `authority`, `effective_date`, `jurisdiction`, `sector`).
3. **Forecasting Engine**: Statistical time-series (Moving Average, Exponential Smoothing, Prophet, TimesFM) with time-based cross validation (MAE, RMSE, WAPE).
4. **Compliance Engine**: Rule-driven engine enforcing tax filing schedules (GSTR-1, GSTR-3B, ITR, TDS) and entity renewals (DSC, Insurance, Udyam).
5. **Market Signal & Festival Engine**: Aggregates macro demand signals, Google Trends, news radar, and regional festival calendars (T-30 to T-3 lead-time triggers).
6. **GeM Intelligence Engine**: Category-vendor tender matching, alert generation, and checklist verification for Government e-Marketplace.
7. **Reconciliation Engine**: Deterministic 3-way matching algorithm for Bank ↔ Invoices, PO ↔ Goods Received, PI ↔ PO, and Sales ↔ GST records.
8. **Agreement Analyzer**: Structured PDF clause extractor evaluating payment terms, termination, penalties, risk score, and compatibility matrix.

### C. Reasoning & Guardrails Layer
- **LLM Provider Abstraction**: Uniform interface (`LLMProvider`) supporting OpenAI, Gemini, Claude, Llama, Mistral, Gemma, and Ollama. Switchable via `LLM_PROVIDER` and `MODEL_NAME` env vars.
- **MSME System Prompt**: Domain system prompt enforcing evidence-backed recommendations, Hinglish/multilingual support, zero numeric hallucination, and explicit source citation.
- **Validation Guardrails**: Output JSON parser validating strict response schema (`answer`, `evidence`, `calculations`, `sources`, `recommendations`, `confidence`, `data_freshness`, `requires_human_review`).

---

## 4. Multi-Tenant SaaS & DPDP Architecture
- **Tenant Isolation**: Every database entity contains `tenant_id`. Strict query filters prevent cross-tenant data leakage.
- **Role-Based Access Control (RBAC)**: `OWNER`, `ADMIN`, `ACCOUNTANT`, `EMPLOYEE`, `VIEWER`.
- **DPDP Compliance**: Consent logs, data minimization, purpose limitation, user data export, right-to-be-forgotten deletion workflows, and audit logging.
