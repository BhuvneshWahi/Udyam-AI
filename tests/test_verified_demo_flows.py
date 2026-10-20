from backend.mock_ai import query_udyam_ai
from backend.aiml.forecast_engine import get_product_recommendation, get_product_forecast
from backend.verified_copilot import detect_intent, get_notifications
from backend.repositories.notification_repository import NotificationRepository


def test_besan_forecast():
    r = query_udyam_ai("Besan ka next week kya scene hai?", {})
    assert r["category"] == "FORECAST"
    # User-facing summary intentionally rounds base demand; exact model output is a metric.
    assert "187 kg" in r["direct_answer"]
    assert r["metrics_summary"][0]["value"] == "186.52 kg"
    assert "266" in r["direct_answer"]
    assert "256 kg" in r["direct_answer"]
    assert r["metrics_summary"][1]["value"] == "~255.8 kg"


def test_gst_due():
    r = query_udyam_ai("Mera GST 3B kab due hai?", {})
    assert r["category"] == "COMPLIANCE"
    assert "01 October 2026" in r["direct_answer"]
    assert "5 days" in r["direct_answer"]


def test_generic_next_gst_due_date_uses_seeded_task_and_discloses_both_dates():
    r = query_udyam_ai(
        "What is my next GST filing due date? Tell me the exact due date, days remaining or overdue, and the reference date used."
    , {})
    assert r["category"] == "COMPLIANCE"
    assert "01 October 2026" in r["direct_answer"]
    assert "26 September 2026" in r["direct_answer"]
    assert "live GST portal check" in r["direct_answer"]
    assert "No later GST due-date record" in r["direct_answer"]
    assert any("SYSTEM DATE" in m["label"] for m in r["metrics_summary"])


def test_notifications():
    r = query_udyam_ai("Mere pending notifications dikhao", {})
    assert r["category"] == "NOTIFICATION"
    assert r["metrics_summary"][0]["value"] == "7"
    assert r["metrics_summary"][1]["value"] == "7"
    assert r["metrics_summary"][2]["value"] == "2"
    assert r["metrics_summary"][3]["value"] == "3"
    assert "Besan Procurement Review" in r["direct_answer"]
    assert "GSTR-3B Tax Due" in r["direct_answer"]
    assert "Seeded demo timeline (reference date: 26 September 2026)" in r["direct_answer"]
    assert "not a live GST portal status" in r["direct_answer"]


def test_business_procurement():
    r = query_udyam_ai("Besan ka stock aur procurement kya scene hai?", {})
    assert r["category"] == "BUSINESS"
    assert "21 kg" in r["direct_answer"]
    assert "20 kg" in r["direct_answer"]


def test_forecast_artifacts():
    rec = get_product_recommendation("prod_besan")
    forecast = get_product_forecast("prod_besan")
    assert rec["base_7_day_demand_kg"] == 186.52
    assert rec["recommended_additional_stock_kg"] == 266.0
    assert len(forecast) == 7


def test_copilot_and_api_share_canonical_notification_feed():
    copilot_feed = get_notifications(vendor_id="vendor_sharma_001")
    api_feed = NotificationRepository().get_notifications()
    assert len(copilot_feed) == 7
    assert len(api_feed) == 7
    assert [item["id"] for item in copilot_feed] == [item["id"] for item in api_feed]


def test_demo_auth_token_is_rejected_when_supabase_is_configured(monkeypatch):
    monkeypatch.delenv("UDYAM_DEMO_MODE", raising=False)
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "configured-test-key")
    from backend.auth.jwt_handler import verify_supabase_token
    assert verify_supabase_token("offline-demo-token") is None



def test_generic_reorder_query_returns_product_recommendations_and_consistent_stock():
    r = query_udyam_ai("What should I reorder?", {})
    assert r["category"] == "BUSINESS"
    assert "Besan" in r["direct_answer"]
    assert "Dry Fruits" in r["direct_answer"]
    assert "Ghee" in r["direct_answer"]
    assert r["structured_table"] is not None
    assert len(r["structured_table"]["rows"]) == 6

    besan = next(
        row for row in r["structured_table"]["rows"]
        if row["Product"] == "Besan"
    )
    assert besan["Current Stock"] == "21 kg"
    assert besan["Incoming PO"] == "20 kg"
    assert besan["Suggested Additional"] == "266 kg"
    assert all(m["label"] != "CURRENT STOCK" or m["value"] != "0 kg" for m in r["metrics_summary"])
    assert any("saved 7-day planning artifact" in item for item in r["why_recommendation"])


def test_monthly_hinglish_reorder_query_does_not_mislabel_7_day_plan():
    r = query_udyam_ai("Agale mahine kaunse products ka stock badhana chahiye?", {})
    assert r["category"] == "BUSINESS"
    assert "saved 7-day plan only" in r["direct_answer"]
    assert "cannot safely" in r["direct_answer"]
    assert r["structured_table"] is None
    assert r["metrics_summary"][0]["value"] == "Next month"
    assert r["metrics_summary"][1]["value"] == "7 days"
    assert r["metrics_summary"][2]["value"] == "Not available"
    assert any("not inferred by multiplying" in item for item in r["why_recommendation"])


def test_english_next_month_reorder_query_does_not_use_7_day_recommendations():
    r = query_udyam_ai("Which products should I stock up for next month?", {})
    assert r["category"] == "BUSINESS"
    assert r["structured_table"] is None
    assert r["metrics_summary"][2]["value"] == "Not available"



def test_negative_monthly_constraint_does_not_trigger_monthly_guard():
    query = (
        "Show inventory and procurement status for Besan, Ghee, and Dry Fruits.\n"
        "Use the connected data. Do not convert the 7-day plan into a monthly forecast."
    )
    r = query_udyam_ai(query, {})
    assert r["category"] == "BUSINESS"
    assert r["structured_table"] is not None
    rows = r["structured_table"]["rows"]
    assert {row["Product"] for row in rows} == {"Besan", "Ghee", "Dry Fruits"}

    by_name = {row["Product"]: row for row in rows}
    assert by_name["Besan"]["Current Stock"] == "21 kg"
    assert by_name["Besan"]["Incoming PO"] == "20 kg"
    assert by_name["Besan"]["Adjusted 7-Day Demand"] == "255.8 kg"
    assert by_name["Besan"]["Suggested Additional"] == "266 kg"
    assert by_name["Ghee"]["Current Stock"] == "54 kg"
    assert by_name["Ghee"]["Incoming PO"] == "0 kg"
    assert by_name["Ghee"]["Adjusted 7-Day Demand"] == "187.7 kg"
    assert by_name["Ghee"]["Suggested Additional"] == "171 kg"
    assert by_name["Dry Fruits"]["Current Stock"] == "18 kg"
    assert by_name["Dry Fruits"]["Incoming PO"] == "0 kg"
    assert by_name["Dry Fruits"]["Adjusted 7-Day Demand"] == "104.2 kg"
    assert by_name["Dry Fruits"]["Suggested Additional"] == "107 kg"


def test_negative_gst_mention_does_not_route_to_compliance():
    query = (
        "Reply with exactly this text: INVENTORY_TEST_731\n"
        "Do not mention GST, monthly forecasts, or previous questions."
    )
    assert detect_intent(query) == "UNKNOWN"


def test_multi_product_query_filters_recommendations_to_named_products():
    r = query_udyam_ai(
        "Compare Besan, Ghee and Dry Fruits inventory and procurement status.", {}
    )
    assert r["category"] == "BUSINESS"
    assert r["structured_table"] is not None
    assert [row["Product"] for row in r["structured_table"]["rows"]] == [
        "Besan", "Ghee", "Dry Fruits"
    ]



def test_negated_product_name_is_not_added_to_multi_product_comparison():
    r = query_udyam_ai(
        "Compare Besan and Dry Fruits inventory.\nDo not include Ghee.", {}
    )
    assert r["category"] == "BUSINESS"
    assert r["structured_table"] is not None
    assert {row["Product"] for row in r["structured_table"]["rows"]} == {
        "Besan", "Dry Fruits"
    }
