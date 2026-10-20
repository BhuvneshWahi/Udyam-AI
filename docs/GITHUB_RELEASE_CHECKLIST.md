# GitHub Release Checklist — Udyam AI

Use this checklist on an internet-connected machine before pushing a public release.

## 1. Install and verify

- Stop previous local frontend/backend processes before testing a fresh extraction. Use one frontend instance on port 3000 and the backend on port 8001 so browser requests cannot accidentally hit an older copy.

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
npm ci
python -m compileall -q backend tests
python -m pytest -q
npm run typecheck
npm run build
```

## 2. Repository hygiene

- The Windows frontend build passed previously with a non-fatal ~1.87 MB minified chunk warning. Confirm with a clean `npm ci`, typecheck, and build for the exact release folder.

- The current Windows frontend build completed with a non-fatal large-chunk warning (~1.87 MB minified). Consider route-level lazy loading/code splitting; do not hide the warning by simply raising the limit.

- Confirm `.env` and real credentials are absent; commit only `.env.example` placeholders.
- Do not commit `node_modules/`, `dist/`, `.venv/`, Python caches, private keys, or local secrets.
- Review any added ML model/checkpoint artifacts and only load artifacts from a trusted source.
- Check that all UI pages intended for the demo use the declared demo business and data provenance.
- Keep the core verified scenario labelled as seeded/synthetic; do not imply a live customer account.

## 3. Functional checks

- Ask: `Besan ka next week kya scene hai?`
- Ask: `Mera GST 3B kab due hai?`
- Ask: `What is my next GST filing due date? Tell me the exact due date, days remaining or overdue, and the reference date used.` Confirm that generic GST due-date queries route to the seeded task, show demo reference date separately from system date, and never claim a live portal lookup or invent a later deadline.
- Ask: `Mere pending notifications dikhao`
- Ask: `What should I reorder?` and confirm the response includes a six-product evidence table, shows Besan at 21 kg on hand plus 20 kg incoming, and does not display a false `0 kg` stock metric.
- Ask: `Show inventory and procurement status for Besan, Ghee, and Dry Fruits.
Use connected data. Do not convert the 7-day plan into a monthly forecast.` Confirm all three requested products appear in one table; a negated safety constraint must not trigger the monthly-horizon guard.
- Ask: `Agale mahine kaunse products ka stock badhana chahiye?` and confirm the app explicitly says monthly recommendations are unavailable while the connected artifact only covers 7 days. Do not render the 7-day table as a monthly forecast.
- Confirm generic procurement responses include the recommendation source and state that additional-stock values are saved planning suggestions, not purchase orders or live model inference.
- Confirm that Copilot and the Notification Center read `backend/verified_data/notifications.csv`.
- Confirm that the demo reference date is set intentionally (`UDYAM_DEMO_DATE`).
- Confirm new-business defaults use the retail demo profile (Delhi / Retail) unless the user supplies their own values.

## 4. Before production deployment

- Configure Supabase Auth, server-side secrets and tenant authorization policies.
- Set `CORS_ORIGINS` to exact deployed frontend origins.
- Use HTTPS and review file upload limits, logging, rate limiting and permissions.
- Verify any claimed government, banking, account-aggregator, live market, mobile-push or scheme-routing integration independently.
- Select and add an appropriate `LICENSE` if the repository is intended for public reuse. If no license is added, do not imply that others have permission to reuse the code.

## Known scope note

Some non-core dashboards still have legacy illustrative data from an earlier automotive/manufacturing fixture. These should be aligned to the grocery-retail demo or clearly labelled before presenting them as part of a single coherent product demo. Procurement quantities in `backend/aiml/udyam_recommendations.json` are saved planning outputs; their reorder-policy formula should be documented and validated before operational purchasing. Hyper-local feasibility and full financial structuring/scheme routing are not implemented end-to-end in this code snapshot.
