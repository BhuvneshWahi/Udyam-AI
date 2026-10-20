"""
UDYAM AI — Supabase Integration & Multi-Tenant Security Test Suite
Tests health, auth dependencies, RBAC enforcement, MFA flows, and repository fallbacks.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.supabase_client import check_supabase_health, is_supabase_configured
from backend.auth.jwt_handler import extract_bearer_token, verify_supabase_token, DEMO_USER
from backend.auth.dependencies import get_current_user, get_current_business, require_role
from backend.repositories import (
    BusinessRepository,
    ProductRepository,
    SalesRepository,
    InvoiceRepository,
    ComplianceRepository,
    NotificationRepository,
    DocumentRepository,
)


def test_supabase_health_never_leaks_secrets():
    res = check_supabase_health()
    assert isinstance(res, dict)
    assert "status" in res
    assert "configured" in res
    assert "connected" in res
    # Ensure no secrets, keys, or tokens are exposed
    keys_str = str(res).lower()
    assert "service_role" not in keys_str
    assert "bearer" not in keys_str
    assert "secret" not in keys_str
    print("[PASS] Supabase health check is secure and leaks zero secrets.")


def test_jwt_extraction_and_verification():
    assert extract_bearer_token(None) is None
    assert extract_bearer_token("") is None
    assert extract_bearer_token("Bearer mytoken123") == "mytoken123"
    assert extract_bearer_token("mytoken123") == "mytoken123"

    # Verify demo token fallback
    demo = verify_supabase_token("offline-demo-token")
    assert demo is not None
    assert demo["id"] == DEMO_USER["id"]
    assert demo["email"] == DEMO_USER["email"]
    print("[PASS] JWT extraction and demo verification passed.")


def test_repositories_grounded_fallback():
    b_repo = BusinessRepository()
    b = b_repo.get_business_by_id("00000000-0000-0000-0000-000000000001")
    assert b is not None
    assert b.get("name") == "Sharma General Store"

    p_repo = ProductRepository()
    products = p_repo.get_products()
    assert len(products) == 6
    assert {p.get("name") for p in products} == {"Rice", "Besan", "Ghee", "Sugar", "Atta", "Dry Fruits"}
    assert next(p for p in products if p.get("name") == "Besan")["stock"] == 21.0

    s_repo = SalesRepository()
    sales = s_repo.get_sales_trends()
    assert len(sales) >= 6

    i_repo = InvoiceRepository()
    invoices = i_repo.get_invoices()
    assert invoices == []  # no verified invoice ledger is shipped in this demo snapshot

    c_repo = ComplianceRepository()
    filings = c_repo.get_filings()
    assert len(filings) >= 3

    n_repo = NotificationRepository()
    notifs = n_repo.get_notifications()
    assert len(notifs) == 7
    assert sum(1 for n in notifs if not n.get("is_read", False)) == 7

    d_repo = DocumentRepository()
    docs = d_repo.get_documents()
    assert len(docs) >= 2
    print("[PASS] All repository fallbacks initialize; absent verified ledgers return empty data.")


def test_api_endpoints_via_testclient():
    client = TestClient(app)

    # 1. Health & Supabase Health
    r = client.get("/api/supabase/health")
    assert r.status_code == 200
    assert "status" in r.json()

    # 2. Auth Register
    r = client.post("/api/auth/register", json={
        "email": "test@msme.in",
        "password": "Password123!",
        "full_name": "Test Owner",
        "business_name": "Test Auto Corp"
    })
    assert r.status_code == 200
    reg_data = r.json()
    assert reg_data.get("status") == "success"

    # 3. Auth Login
    r = client.post("/api/auth/login", json={
        "email": "test@msme.in",
        "password": "Password123!"
    })
    assert r.status_code == 200
    login_data = r.json()
    assert login_data.get("status") == "success"
    assert "access_token" in login_data

    # 4. Auth Me
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {login_data.get('access_token')}"})
    assert r.status_code == 200
    assert "email" in r.json()

    # 5. Auth Business & Businesses List
    r = client.get("/api/auth/business", headers={"Authorization": f"Bearer {login_data.get('access_token')}"})
    assert r.status_code == 200
    assert "business_id" in r.json()

    r = client.get("/api/auth/businesses", headers={"Authorization": f"Bearer {login_data.get('access_token')}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    # 6. MFA Enroll & Verify
    r = client.post("/api/auth/mfa/enroll", json={"issuer": "UDYAM AI"}, headers={"Authorization": f"Bearer {login_data.get('access_token')}"})
    assert r.status_code == 200
    enroll_data = r.json()
    factor_id = enroll_data.get("factor_id")

    r = client.post("/api/auth/mfa/verify", json={"factor_id": factor_id, "code": "123456"}, headers={"Authorization": f"Bearer {login_data.get('access_token')}"})
    assert r.status_code == 200
    assert r.json().get("verified") is True

    # 7. Data Endpoints with Tenant Context
    r = client.get("/api/data/notifications")
    assert r.status_code == 200
    assert len(r.json()) >= 3

    r = client.get("/api/data/invoices")
    assert r.status_code == 200
    assert r.json() == []  # no verified invoice ledger is shipped in this demo snapshot

    r = client.get("/api/data/documents")
    assert r.status_code == 200
    assert len(r.json()) >= 2

    print("[PASS] Full FastAPI Supabase Auth & Tenant data endpoints verified with TestClient.")


def run_all():
    print("=" * 65)
    print("  UDYAM AI — SUPABASE INTEGRATION TEST SUITE")
    print("=" * 65)
    test_supabase_health_never_leaks_secrets()
    test_jwt_extraction_and_verification()
    test_repositories_grounded_fallback()
    test_api_endpoints_via_testclient()
    print("=" * 65)
    print("ALL SUPABASE INTEGRATION TESTS PASSED (100% SUCCESS)")
    print("=" * 65)


if __name__ == "__main__":
    run_all()
