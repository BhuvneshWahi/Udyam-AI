import os
import sys
import io
import json
import urllib.request
import pandas as pd

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi.testclient import TestClient
from backend.main import app
from ai.llm.factory import get_llm_provider

def test_full_system():
    print("============================================================")
    print("      UDYAM AI — FULL END-TO-END SYSTEM VERIFICATION       ")
    print("============================================================")
    client = TestClient(app)
    tests_passed = 0
    total_tests = 0

    def assert_test(name, condition, details=""):
        nonlocal tests_passed, total_tests
        total_tests += 1
        if condition:
            print(f"[PASS] {name} {details}")
            tests_passed += 1
        else:
            print(f"[FAIL] {name} {details}")

    # 1. Ollama Connectivity Check
    try:
        req = urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=5)
        ollama_data = json.loads(req.read())
        models = [m.get("name") for m in ollama_data.get("models", [])]
        has_llama = any("llama3.2:3b" in m for m in models)
        assert_test("1. Ollama Service & Model Connectivity", has_llama, f"(Available models: {models})")
    except Exception as e:
        assert_test("1. Ollama Service & Model Connectivity", False, f"Error: {e}")

    # 2. AI Copilot Query (Real Inference)
    try:
        res = client.post("/api/copilot/chat", json={"query": "Agle mahine kaunse products ka stock badhana chahiye?"})
        data = res.json()
        has_answer = res.status_code == 200 and len(data.get("direct_answer", "")) > 10
        assert_test("2. AI Copilot Query (Grounded Inference)", has_answer, f"Answer: {data.get('direct_answer')[:60]}...")
    except Exception as e:
        assert_test("2. AI Copilot Query (Grounded Inference)", False, f"Error: {e}")

    # 3. Invoice Generation Data Contract
    try:
        res = client.get("/api/data/products")
        products = res.json()
        has_products = res.status_code == 200 and len(products) > 0 and "selling_price" in products[0]
        assert_test("3. Tax Invoice Product Catalog Contract", has_products, f"({len(products)} SKUs verified)")
    except Exception as e:
        assert_test("3. Tax Invoice Product Catalog Contract", False, f"Error: {e}")

    # 4. Agreement Analysis (Deterministic + Ollama Enhancement)
    try:
        contract_text = "Master supply agreement. Payment terms Net 60 days. Delivery delay penalty 2% per week. 30 days written notice."
        res = client.post("/api/agreement/analyze", json={"agreement_text": contract_text})
        agr = res.json()
        has_terms = res.status_code == 200 and "60" in agr.get("payment_terms", "") and len(agr.get("risk_flags", [])) > 0
        assert_test("4. Agreement Analysis Engine", has_terms, f"(Score: {agr.get('compatibility_score')} | Risks: {len(agr.get('risk_flags', []))})")
    except Exception as e:
        assert_test("4. Agreement Analysis Engine", False, f"Error: {e}")

    # 5. File Processing - CSV Upload
    try:
        csv_bytes = b"date,product_id,quantity,amount,customer\n2026-09-01,PROD-101,10,25000,Illustrative Customer A"
        res = client.post(
            "/api/data/upload",
            files={"file": ("test_sales.csv", io.BytesIO(csv_bytes), "text/csv")},
            data={"file_type": "sales"}
        )
        has_upload = res.status_code == 200 and res.json().get("status") == "Success"
        assert_test("5. CSV Upload Processing & Session Merge", has_upload, f"({res.json().get('records_processed')} records)")
    except Exception as e:
        assert_test("5. CSV Upload Processing & Session Merge", False, f"Error: {e}")

    # 6. File Processing - XLSX Upload
    try:
        df = pd.DataFrame([{"sku": "SKU-99", "name": "Heavy Duty Clamp", "stock": 100, "cost_price": 40, "selling_price": 90, "avg_daily_sales": 5}])
        excel_buf = io.BytesIO()
        df.to_excel(excel_buf, index=False)
        excel_buf.seek(0)
        res = client.post(
            "/api/data/upload",
            files={"file": ("test_stock.xlsx", excel_buf, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"file_type": "inventory"}
        )
        has_excel = res.status_code == 200 and res.json().get("status") == "Success"
        assert_test("6. XLSX Spreadsheet Upload Processing", has_excel, f"({res.json().get('records_processed')} records)")
    except Exception as e:
        assert_test("6. XLSX Spreadsheet Upload Processing", False, f"Error: {e}")

    # 7. File Processing - PDF Document Upload & Analysis
    try:
        pdf_bytes = b"%PDF-1.4 Vendor supply agreement. Payment terms Net 45 days. Termination notice 30 days."
        res = client.post(
            "/api/data/upload",
            files={"file": ("vendor_agreement.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
            data={"file_type": "document"}
        )
        has_pdf = res.status_code == 200 and res.json().get("import_mode") == "DOCUMENT_ANALYSIS"
        assert_test("7. PDF Document Upload & Clause Extraction", has_pdf, f"({res.json().get('analysis', {}).get('clauses_analyzed')} clauses)")
    except Exception as e:
        assert_test("7. PDF Document Upload & Clause Extraction", False, f"Error: {e}")

    # 8. PI / PR & PO Procurement Workflow Contract
    try:
        res = client.get("/api/data/inventory")
        inv = res.json()
        has_recs = res.status_code == 200 and len(inv.get("recommendations", [])) > 0
        assert_test("8. PI / PR Procurement Recommendations", has_recs, f"({len(inv.get('recommendations', []))} stockout actions triggered)")
    except Exception as e:
        assert_test("8. PI / PR Procurement Recommendations", False, f"Error: {e}")

    # 9. Action Plan & Operational Execution
    try:
        res = client.get("/api/data/actions")
        actions = res.json()
        has_actions = res.status_code == 200 and len(actions) > 0
        assert_test("9. AI Action Plan Generation & Triage", has_actions, f"({len(actions)} operational actions active)")
    except Exception as e:
        assert_test("9. AI Action Plan Generation & Triage", False, f"Error: {e}")

    # 10. Financial Health & Reconciliation Dashboard
    try:
        res_fin = client.get("/api/data/finance")
        res_rec = client.get("/api/data/reconciliation")
        has_fin = res_fin.status_code == 200 and "working_capital_ratio" in res_fin.json()
        has_rec = res_rec.status_code == 200 and res_rec.json().get("summary", {}).get("total_mismatches", 0) >= 0
        assert_test("10. Financial Health & Reconciliation Data", has_fin and has_rec, f"(WCR: {res_fin.json().get('working_capital_ratio')}x | Runway: {res_fin.json().get('liquidity_runway_days')} days)")
    except Exception as e:
        assert_test("10. Financial Health & Reconciliation Data", False, f"Error: {e}")

    # 11. Market Signals & Festival Trends
    try:
        res_mkt = client.get("/api/data/market-signals")
        res_fes = client.get("/api/data/festivals")
        has_mkt = res_mkt.status_code == 200 and len(res_mkt.json().get("signals", [])) > 0
        has_fes = res_fes.status_code == 200 and len(res_fes.json().get("festivals", [])) > 0
        assert_test("11. Market Signals & Festival Trends Intelligence", has_mkt and has_fes, f"({len(res_mkt.json().get('signals', []))} market signals | {len(res_fes.json().get('festivals', []))} festivals)")
    except Exception as e:
        assert_test("11. Market Signals & Festival Trends Intelligence", False, f"Error: {e}")

    # 12. Government Schemes Engine
    try:
        res = client.get("/api/data/schemes")
        schemes = res.json().get("schemes", [])
        has_schemes = res.status_code == 200 and len(schemes) >= 4
        assert_test("12. Government Schemes Eligibility Engine", has_schemes, f"({len(schemes)} schemes mapped: {[s.get('name')[:15] for s in schemes]})")
    except Exception as e:
        assert_test("12. Government Schemes Eligibility Engine", False, f"Error: {e}")

    print("------------------------------------------------------------")
    print(f"VERIFICATION SCORE: {tests_passed}/{total_tests} TESTS PASSED")
    print("============================================================")
    return 0 if tests_passed == total_tests else 1

if __name__ == "__main__":
    sys.exit(test_full_system())
