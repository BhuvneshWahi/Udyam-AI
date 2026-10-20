# UDYAM AI — AI Business Copilot for Indian MSMEs

**Team:** NEURALS  
**Demo business:** Sharma General Store · Delhi · Grocery / Retail  
**Demo date:** 26 September 2026

## What this repo contains

UDYAM AI is an intelligence/copilot layer over business data. It combines:

`Internal business data + ML demand forecast + external market/event signals + compliance knowledge → Copilot → action / alert`

The documented core demo uses deterministic seeded files for numerical facts. When a required compliance record is missing, the app fails closed instead of inventing a deadline. Some non-core dashboard pages still contain illustrative fixtures; see “Scope and known limitations.”

## Verified demo flows

### 1. Demand + procurement
Ask:

> Besan ka next week kya scene hai?

The verified pipeline surfaces:
- Base 7-day demand: **186.52 kg**
- Adjusted demand: **~255.8 kg**
- Current stock: **21 kg**
- Incoming PO: **20 kg**
- Market signal: **+14%**
- Festival effect: **+24%**
- Priority: **HIGH**
- Planning statement: **Review procurement for approximately 266 kg additional Besan.**

### 2. Compliance
Ask:

> Mera GST 3B kab due hai?

Returns the saved demo record (not a live GST-portal lookup):
- Filing form: **GSTR-3B**
- Saved due date: **01 October 2026**
- On the seeded demo reference date (**26 September 2026**), this was **5 days away**.
- Against a system date of **11 October 2026**, the saved task is **10 days overdue**.
- Status in the source record: **Pending**. No newer due-date record is present, so the app does not guess the next statutory deadline.

### 3. Multi-product procurement comparison
Ask:

> Show the current inventory and procurement status for Besan, Ghee, and Dry Fruits using the connected data.

The verified response includes all three products in one evidence table. Current demo values are Besan **21 kg stock / 20 kg incoming**, Ghee **54 kg / 0 kg incoming**, and Dry Fruits **18 kg / 0 kg incoming**. Adjusted demand and additional-stock recommendations are from the saved 7-day planning artifact, not live per-query model inference or generated purchase orders.

### 4. Proactive notifications
Ask:

> Mere pending notifications dikhao

Returns the verified notification feed:
- 7 total / 7 unread
- 2 HIGH
- 3 MEDIUM
- 2 LOW
- festive market signal
- Besan procurement PO
- GSTR-3B due
- Dhanteras / Diwali alerts

## ML model

The checked-in LightGBM model artifact is a regression model for 7-day retail demand forecasting. The notebook documented a temporal 80/10/10 evaluation. Reported test results:

| Model | Test MAE | Test RMSE |
|---|---:|---:|
| Previous-day baseline | 7.912 | 10.892 |
| 7-day moving average | 7.007 | 9.645 |
| **LightGBM** | **4.913** | **6.458** |

The trained model, feature schema, final forecast output and recommendation JSON are checked into `backend/aiml/`.

## Architecture

```text
React + Vite UI
       │
       ▼
FastAPI (/api)
       │
       ▼
Verified Copilot
   ┌───┼──────────────┐
   ▼   ▼              ▼
 ML  Market      Compliance
     + Events        RAG
   │       │          │
   └───────┴──────┬───┘
                   ▼
             Actions / Alerts
```

### Truth sources

- Forecast → `backend/aiml/forecast_output.csv` + `udyam_recommendations.json`
- Inventory → `backend/verified_data/inventory.csv`
- Procurement → `backend/verified_data/purchase_orders.csv`
- Market → `backend/verified_data/market_signals.csv` / `market_radar.csv`
- Compliance due dates → `backend/verified_data/compliance_tasks.csv`
- Notifications → `backend/verified_data/notifications.csv`
- Compliance RAG → `backend/rag/` (optional local index; fails closed if unavailable)

## Run locally

### Requirements

- Python 3.11+
- Node.js 20+
- npm

### First-time setup

From the repository root, create and activate a virtual environment, then install dependencies:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
npm ci
```

Copy `.env.example` to `.env` only when configuring environment values. The local demo can run without Supabase credentials; Supabase-backed features require valid server-side credentials. Never commit `.env` or a Supabase service-role key.

### One-command Windows demo

After first-time setup, from PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\start_demo.ps1
```

The script starts:
- FastAPI on `http://127.0.0.1:8001`
- Vite on `http://localhost:3000`
- Browser opens automatically

It stops with a clear message if either port is already occupied. Stop old frontend/backend terminals before running it so you do not accidentally test a stale app instance.

The script refuses to start if either port is already occupied, to avoid accidentally mixing old and new instances. Stop any previous demo terminals first.

### Manual

Terminal 1:

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```

Terminal 2:

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 3000 --strictPort
```

## Demo configuration

The seeded scenario uses a stable reference date so demo countdowns stay reproducible.
The default is `2026-09-26`; override it with the `UDYAM_DEMO_DATE` environment
variable in `YYYY-MM-DD` format when intentionally testing a different reference date.
The Copilot notification engine and offline Notification Center fallback both read
`backend/verified_data/notifications.csv` as their canonical notification feed.

## Test and build

Run the complete Python suite:

```powershell
python -m pytest -q
```

Current release-candidate baseline: **28 Python tests passed** in the packaging environment. Re-run the suite after installing dependencies; test counts can change as tests are added.

After installing JavaScript dependencies with `npm ci`, validate TypeScript and build the frontend:

```powershell
npm run typecheck
npm run build
```

The Windows verification flow completed `npm run typecheck` and `npm run build` successfully; Vite emitted a non-fatal warning for a JavaScript chunk of roughly 1.87 MB minified. Re-run these commands after a clean `npm ci` on the release machine. Consider code splitting as a performance follow-up.

## Security / deployment notes

- CORS defaults to the documented local Vite origins. Configure `CORS_ORIGINS` with exact trusted frontend origins when deploying.
- Offline/demo tokens are accepted only when demo mode is enabled. Demo mode defaults on only when Supabase is unconfigured; with Supabase configured it defaults off. Set `UDYAM_DEMO_MODE=true` only for a trusted local demo.
- A production deployment must configure Supabase Auth, restrict CORS to the deployed frontend, use HTTPS, and review authorization policies before handling real business data.

## Push this project to GitHub

From the extracted repository root, review the staged file list before committing. Do not upload `.env`, credentials, `node_modules/`, `dist/`, or local data. Create an empty repository on GitHub first, then run (replace the placeholder URL with your repository URL):

```powershell
git init
git add .
git status --short
# Review the list above; unstage anything private before continuing.
git commit -m "Prepare Udyam AI demo release"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/Udyam-AI.git
git push -u origin main
```

If this project is intended for public reuse, choose and add a license before publishing. This handoff intentionally does not choose a legal license on the owner's behalf.

## Repository hygiene

The three cleaned notebooks under `notebooks/` contain the final, presentation-oriented paths only. Exploratory notebook debugging, package-version churn and Drive-specific handoff cells were removed from the handoff set. The original notebooks remain outside this repo as the research record.

## Data provenance note

This hackathon repo uses a coherent **seeded/demo vendor scenario**, not a live Sharma General Store account. Demo values should be described to judges as seeded inputs for deterministic evaluation.

## RAG note

The submitted RAG notebook used a local SentenceTransformers embedding index. The cleaned runtime adapter is fail-closed: it returns “I could not verify this from the connected compliance knowledge base” when the saved index/model assets are not available. This is intentional and prevents unsupported compliance claims.

## Scope and known limitations

- The validated end-to-end demo flows are demand/procurement for Besan, the seeded GSTR-3B due-date answer, and the seven seeded notifications.
- The repository’s non-core dashboard pages still include legacy illustrative fixtures from an earlier automotive/manufacturing prototype. Those fixtures are not authoritative Sharma General Store records and must not be presented as live or verified retail data.
- The seeded GSTR-3B task is dated 01 October 2026 against a default demo reference date of 26 September 2026. Generic GST due-date questions disclose both the demo anchor and backend system date; because the dataset has no newer GST due-date task, the app will not guess the next upcoming statutory deadline or claim a live GST portal check.
- Market signals and festival alerts are seeded/cached demonstration inputs, not live scraping or a real-time feed.
- Supabase, bank/account-aggregator, government-portal, and mobile-push integrations require their own configuration and verification; local fallback mode is not a production deployment. No verified customer/invoice/bank reconciliation ledger is bundled, so receivables and reconciliation flows intentionally return no verified records.
- Hyper-local competitor mapping, business-feasibility scoring, and a PS26091 financial structuring/scheme-routing engine are proposed extensions, not implemented end-to-end in this code snapshot. Do not imply they are already deployed.
- Several business KPI, sales-history, cash-flow, pricing and margin examples outside the core verified flow remain illustrative UI fixtures. Confirm source records before using them in financial or compliance decisions.

Historical audit documents under `docs/` may describe an earlier demo fixture or environment. The README and current automated tests are the current baseline; old audit claims are not a substitute for a fresh release build or security review.


## License

No license file is included in this handoff. If you publish this repository publicly and want to grant reuse rights, choose and add an appropriate license before publishing; without a license, public visibility does not automatically grant reuse permission.
