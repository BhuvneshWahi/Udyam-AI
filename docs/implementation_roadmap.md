# UDYAM AI — 14-Phase Technical Implementation Roadmap

- **Phase 1: Core Architecture, Provider Abstraction & Grounded Copilot** [ACTIVE / COMPLETE]
  - Modular `ai/` package structure (`LLMProvider`, system prompts, structured guardrails schema).
  - Canonical data model (`backend/canonical_schema.py`).
  - Deterministic financial analytics & 3-way reconciliation engines (`backend/services/`).

- **Phase 2: RAG Knowledge System & Vector DB Integration**
  - Qdrant / pgvector integration for GST circulars, schemes, GeM guidelines with strict metadata schema.

- **Phase 3: Deterministic Financial Engine Expansion**
  - Detailed working capital, cash conversion cycle, cash flow stress test algorithms.

- **Phase 4: Inventory & Time-Series Demand Forecasting Engine**
  - Moving Average, Exponential Smoothing, Prophet integration with WAPE/MAE error validation.

- **Phase 5: Market Signal Intelligence Engine**
  - Market signal scoring, Google Trends pipeline, sector matching logic.

- **Phase 6: Festival & Event Intelligence**
  - Indian festival knowledge base with lead times (T-30 to T-3) and automated alert generators.

- **Phase 7: Sector News Radar**
  - News deduplication, entity extraction, MSME impact classifier.

- **Phase 8: Compliance Rules Engine & Filing Schedule Engine**
  - Configurable compliance rules table with multi-stage reminders (30, 15, 7, 3, 1 days).

- **Phase 9: Procurement Workflow (PI / PO / PR)**
  - Requisition approval, PO verification, Proforma invoice tracking.

- **Phase 10: Deterministic Reconciliation Engine**
  - Bank ↔ Invoice, GST ↔ Sales, PO ↔ Goods Received 3-way matching.

- **Phase 11: GeM Tender Intelligence**
  - Vendor category matching, tender alerts, application eligibility checklists.

- **Phase 12: Agreement & Contract Analyzer**
  - Clause extractor, risk scoring, compatibility matrix.

- **Phase 13: Voice & Multilingual Integration**
  - Bhashini / AI4Bharat IndicASR & TTS provider interfaces.

- **Phase 14: SaaS Multi-Tenancy & DPDP Security Controls**
  - Tenant isolation, RBAC enforcement, consent logging, right-to-be-forgotten deletion workflows.
