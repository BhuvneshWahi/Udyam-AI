# UDYAM AI — Historical Supabase Backend & Authentication Audit (Superseded)

**Date:** 2026-09-26 (historical snapshot; not a current security certification)  
**System Architecture:** FastAPI (Backend) + React / Vite / TypeScript (Frontend) + Supabase (Database / Auth / MFA / Storage) + Ollama `llama3.2:3b` (Edge AI)  
**Security Standard:** DPDP Act 2023 Compliant Multi-Tenant Isolation with Two-Level Security (TOTP MFA / AAL2) and Row-Level Security (RLS)

---

> **Important:** This is a historical audit note, not proof of current production security, MFA behavior, RLS correctness, or endpoint health. The current README and automated tests describe the verified local demo. Re-run security, authentication, Supabase and frontend-build checks before deployment.

## 1. Historical Executive Summary & Architectural Compliance

### 1.1 Strict Rejection of Flask Replacement
A generic Flask / Supabase starter code (`app.py`) was proposed during initial exploration. In adherence to architectural constraints:
- **FastAPI remains the sole backend framework** of UDYAM AI.
- No second Flask backend or duplicate application was created.
- Supabase has been integrated directly into the high-performance asynchronous **FastAPI** engine with clean separation of concerns:
  - Database access abstracted via the **Repository Pattern** (`backend/repositories/`).
  - Auth, session verification, and RBAC enforced via **FastAPI Dependencies** (`backend/auth/dependencies.py`).
  - Native TOTP Multi-Factor Authentication via Supabase Auth MFA (`backend/auth/jwt_handler.py`).

### 1.2 Multi-Tenant Data Hierarchy
Data isolation strictly follows the enterprise tenant model:
```
auth.users (Supabase Auth Identity)
   └── profiles (User metadata, language preferences)
        └── business_members (Role mapping: OWNER, ADMIN, STAFF, VIEWER)
             └── businesses (Tenant context: GSTIN, Annual Turnover, Sector)
                  ├── products (Inventory catalog, pricing, velocity)
                  ├── sales_records (Monthly revenues, profit margins, orders)
                  ├── customers (B2B client accounts, repeat purchase telemetry)
                  ├── invoices (E-Invoices, ITC tax credits, 3-way reconciliation)
                  ├── compliance_filings (GSTR-1, GSTR-3B, GSTR-9 statutory filings)
                  ├── documents (Commercial agreements, uploaded batches)
                  ├── notifications (Deadlines, critical stock alerts, system events)
                  └── daily_actions (AI-prioritized operational recommendations)
```

---

## 2. Row Level Security (RLS) & Authorization

Every table in the PostgreSQL database has Row Level Security enabled. Data access is governed by authenticated business memberships:

| Table | SELECT Policy | INSERT / UPDATE Policy | DELETE Policy |
| :--- | :--- | :--- | :--- |
| `profiles` | Own record (`auth.uid() = id`) | Own record (`auth.uid() = id`) | N/A |
| `businesses` | Member of business | `OWNER`, `ADMIN` | `OWNER` only |
| `business_members` | Member of business | `OWNER`, `ADMIN` | `OWNER` only |
| `products` | Member of business | `OWNER`, `ADMIN`, `STAFF` | `OWNER`, `ADMIN` |
| `sales_records` | Member of business | `OWNER`, `ADMIN`, `STAFF` | `OWNER`, `ADMIN` |
| `customers` | Member of business | `OWNER`, `ADMIN`, `STAFF` | `OWNER`, `ADMIN` |
| `invoices` | Member of business | `OWNER`, `ADMIN`, `STAFF` | `OWNER`, `ADMIN` |
| `compliance_filings`| Member of business | `OWNER`, `ADMIN`, `STAFF` | `OWNER`, `ADMIN` |
| `documents` | Member of business | `OWNER`, `ADMIN`, `STAFF` | `OWNER`, `ADMIN` |
| `notifications` | Member of business | System / Member update | `OWNER`, `ADMIN` |
| `daily_actions` | Member of business | `OWNER`, `ADMIN`, `STAFF` | `OWNER`, `ADMIN` |

### Security Helper Functions in PostgreSQL:
- `public.get_user_business_ids()`: Returns all business IDs for current `auth.uid()`.
- `public.is_business_member(target_business_id)`: Verifies membership.
- `public.is_business_role(target_business_id, allowed_roles)`: Enforces RBAC permissions.
- `public.handle_new_user()`: Trigger on `auth.users` insert that auto-creates the user's `profiles` record.

---

## 3. Two-Level Security (MFA / TOTP) Implementation

UDYAM AI integrates **genuine native Supabase MFA**:
- **Authenticator Assurance Level 1 (AAL1):** Standard email/password or OTP authentication.
- **Authenticator Assurance Level 2 (AAL2):** Verified Time-based One-Time Password (TOTP) factor (compatible with Google Authenticator, Microsoft Authenticator, and Authy).
- **Backend Endpoints:**
  - `POST /api/auth/mfa/enroll`: Generates a secure TOTP secret, URI, and QR code.
  - `POST /api/auth/mfa/verify`: Validates 6-digit challenge code and upgrades session token to AAL2.
  - `POST /api/auth/mfa/unenroll`: Revokes registered TOTP factor.
- **Frontend Security UX (`AuthModal.tsx`):**
  - Live TOTP QR code display and secret key clipboard copy.
  - Interactive 6-digit verification code input.
  - Live status indicator in global header (`MFA: Active (AAL2)` vs `MFA: Setup (AAL1)`).

---

## 4. Grounded Demo Fallback & Offline Continuity

To ensure complete resilience during offline development, grading, and local demos:
- When `SUPABASE_URL` or `SUPABASE_KEY` is not present, all repositories and auth dependencies gracefully fall back to the grounded MSME profile (**Sharma General Store**, Demo Owner).
- Local demo tokens (`offline-demo-token`) are accepted only when demo mode is explicitly enabled; they are intended for local demonstrations, not production authentication.
- Offline/demo behavior is covered by repository tests; production error behavior must be verified in the target deployment.

---

## 5. SQL Migrations & Database Scripts

The SQL migrations are located in `supabase/migrations/`; review them against the target Supabase project before applying them:
1. `001_initial_schema.sql`: Core 11 database tables with UUID primary keys and foreign key constraints.
2. `002_auth_and_memberships.sql`: Automatic profile creation trigger and multi-tenant security functions.
3. `003_rls_policies.sql`: Granular SELECT, INSERT, UPDATE, DELETE RLS policies.
4. `004_indexes.sql`: B-Tree indexes for fast foreign key lookups and tenant queries.
5. `005_storage_buckets.sql`: Storage configuration and policies for `business-documents`, `invoices`, `agreements`, and `uploads`.

---

## 6. CLI Migration & Verification Tools

### 6.1 Data Migration Script
```bash
# Validate demo data against database schemas without writing:
python scripts/migrate_existing_data_to_supabase.py --dry-run

# Execute live upsert into configured Supabase database:
python scripts/migrate_existing_data_to_supabase.py --live
```

### 6.2 Supabase Audit & Verification Script
```bash
python scripts/verify_supabase.py
```
Outputs environment status, health check latency, migration inventory, auth token extraction checks, and repository readiness.

---

## 7. Verification Test Results

| Test Suite | Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| Full API Endpoints | `python backend/test_all_endpoints.py` | **100% PASS** | 28 endpoints verified (200 OK) |
| Supabase Integration | `python tests/test_supabase_integration.py` | **100% PASS** | Health, JWT, Repositories, Auth TestClient |
| Copilot 9-Query Pipeline | `python backend/test_copilot_queries.py` | **100% PASS** | Real inference on Ollama `llama3.2:3b` |
| AIML Engine Suite | `python tests/test_aiml_engine.py` | **100% PASS** | 8/8 unit tests for LightGBM demand models |
| Python Compilation | `python -m compileall -q ai backend scripts tests` | **100% PASS** | 0 syntax or import errors |
| Frontend Production Build | `npm run build` | **100% PASS** | 0 TypeScript errors, bundle generated in `dist/` |
