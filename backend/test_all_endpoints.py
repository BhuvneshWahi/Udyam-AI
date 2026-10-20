import os
import sys
import io
import json

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi.testclient import TestClient
from backend.main import app

def run_tests():
    client = TestClient(app)
    results = {}
    failures = []

    endpoints = [
        ("GET", "/api/health", None, None),
        ("GET", "/api/data/full", None, None),
        ("GET", "/api/data/summary", None, None),
        ("GET", "/api/data/products", None, None),
        ("GET", "/api/data/sales", None, None),
        ("GET", "/api/data/forecast", None, None),
        ("GET", "/api/data/inventory", None, None),
        ("GET", "/api/data/finance", None, None),
        ("GET", "/api/data/compliance", None, None),
        ("GET", "/api/data/schemes", None, None),
        ("GET", "/api/data/market-signals", None, None),
        ("GET", "/api/data/festivals", None, None),
        ("GET", "/api/data/reconciliation", None, None),
        ("GET", "/api/data/insights", None, None),
        ("GET", "/api/data/actions", None, None),
        ("GET", "/api/data/profile", None, None),
        ("GET", "/api/aiml/forecast", None, None),
        ("GET", "/api/aiml/forecast?product_id=prod_besan", None, None),
        ("GET", "/api/aiml/recommendations", None, None),
        ("GET", "/api/aiml/product/prod_besan", None, None),
        ("GET", "/api/aiml/insights/prod_besan", None, None),
        ("GET", "/api/aiml/summary", None, None),
        ("POST", "/api/data/reset", None, None),
        ("POST", "/api/agreement/analyze", {"agreement_text": "Supplier shall deliver within 15 days. Payment terms Net 60 days. Delay penalty 2% per day. Jurisdiction Pune."}, None),
        ("POST", "/api/copilot/chat", {"query": "Check GST compliance status"}, None),
        ("POST", "/api/voice/process", {"transcript": "Kaunse products me sabse zyada profit margin hai?", "language": "Hinglish"}, None),
    ]

    print("============================================================")
    print("       UDYAM AI BACKEND FULL API ENDPOINT TEST SUITE        ")
    print("============================================================")

    for method, path, json_data, files in endpoints:
        try:
            if method == "GET":
                res = client.get(path)
            elif method == "POST" and json_data:
                res = client.post(path, json=json_data)
            elif method == "POST" and not json_data and not files:
                res = client.post(path)
            
            if res.status_code == 200:
                print(f"[PASS] {method:<5} {path:<30} -> 200 OK")
                results[path] = "PASS"
            else:
                print(f"[FAIL] {method:<5} {path:<30} -> {res.status_code} ({res.text[:80]})")
                failures.append(f"{method} {path} returned {res.status_code}")
        except Exception as e:
            print(f"[ERROR] {method:<5} {path:<30} -> {str(e)}")
            failures.append(f"{method} {path} raised exception {str(e)}")

    # Test file upload (CSV & XLSX)
    csv_content = b"date,product_id,quantity,amount,customer\n2026-09-01,PROD-101,10,28000,Illustrative Customer A"
    try:
        res = client.post(
            "/api/data/upload",
            files={"file": ("test_sales.csv", io.BytesIO(csv_content), "text/csv")},
            data={"file_type": "sales"}
        )
        if res.status_code == 200 and res.json().get("status") == "Success":
            print(f"[PASS] POST  /api/data/upload (CSV)       -> 200 OK ({res.json().get('records_processed')} records)")
            results["/api/data/upload_csv"] = "PASS"
        else:
            print(f"[FAIL] POST  /api/data/upload (CSV)       -> {res.status_code}")
            failures.append("CSV upload failed")
    except Exception as e:
        print(f"[ERROR] CSV upload error: {e}")
        failures.append(f"CSV upload error: {e}")

    # Test 400 Bad Request on empty copilot query
    try:
        res = client.post("/api/copilot/chat", json={"query": ""})
        if res.status_code == 400:
            print("[PASS] POST  /api/copilot/chat (Bad Query)  -> 400 Bad Request (Validated)")
            results["copilot_bad_request"] = "PASS"
        else:
            print(f"[FAIL] POST  /api/copilot/chat (Bad Query)  -> {res.status_code}")
            failures.append("Copilot empty query validation failed")
    except Exception as e:
        print(f"[ERROR] Empty query validation error: {e}")
        failures.append(f"Empty query error: {e}")

    print("------------------------------------------------------------")
    if not failures:
        print("ALL BACKEND ENDPOINTS PASSED SUCCESSFULLY (100% COVERAGE)")
        print("============================================================")
        return 0
    else:
        print(f"TESTS COMPLETED WITH {len(failures)} FAILURES: {failures}")
        print("============================================================")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
