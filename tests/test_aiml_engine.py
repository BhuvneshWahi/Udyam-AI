"""
Unit Tests for UDYAM AI — AIML Module & LightGBM Demand Forecasting.
Tests loading of precomputed artifacts, forecast extraction, recommendation calculations,
planning language verification, alias resolution, and edge cases.
"""

import sys
from pathlib import Path

# Ensure root workspace is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.aiml.forecast_engine import (
    load_forecast,
    load_recommendations,
    load_features,
    get_product_forecast,
    get_product_recommendation,
    get_product_insight,
    get_all_recommendations,
    get_all_forecasts,
    get_aiml_summary,
    resolve_product_id,
)


def test_load_forecast_schema_and_size():
    df = load_forecast()
    assert not df.empty, "Forecast dataframe must not be empty"
    expected_cols = {"date", "product_id", "product_name", "predicted_demand", "market_signal", "event_adjustment", "adjusted_demand"}
    assert expected_cols.issubset(set(df.columns)), f"Missing expected columns: {expected_cols - set(df.columns)}"
    assert len(df) == 42, f"Expected 42 forecast records (7 days * 6 products), got {len(df)}"


def test_load_recommendations_count():
    data = load_recommendations()
    recs = data.get("recommendations", [])
    assert len(recs) == 6, f"Expected 6 commodity recommendations, got {len(recs)}"
    expected_pids = {"prod_atta", "prod_besan", "prod_dryfr", "prod_ghee", "prod_rice", "prod_sugar"}
    found_pids = {r["product_id"] for r in recs}
    assert expected_pids == found_pids, f"Mismatch in product IDs: {expected_pids ^ found_pids}"


def test_load_features():
    features = load_features()
    assert len(features) == 23, f"Expected 23 LightGBM features, got {len(features)}"
    assert "days_to_diwali" in features
    assert "festive_sensitivity" in features


def test_besan_grounded_metrics():
    insight = get_product_insight("prod_besan")
    assert insight is not None, "Besan insight must not be None"
    assert insight["product_name"] == "Besan"
    assert len(insight["forecast"]) == 7, "Besan must have 7 daily forecasts"

    rec = insight["recommendation"]
    assert rec["base_7_day_demand_kg"] == 186.52
    assert rec["adjusted_7_day_demand_kg"] == 255.8
    assert rec["current_inventory_kg"] == 21.0
    assert rec["incoming_po_kg"] == 20.0
    assert rec["recommended_additional_stock_kg"] == 266.0
    assert rec["priority"] == "HIGH"

    # Enforce strict planning statement format
    expected_statement = "Review procurement for approximately 266 kg additional Besan stock."
    assert rec["planning_statement"] == expected_statement
    assert insight["planning_statement"] == expected_statement


def test_product_alias_resolution():
    assert resolve_product_id("besan") == "prod_besan"
    assert resolve_product_id("Besan") == "prod_besan"
    assert resolve_product_id("dry fruits") == "prod_dryfr"
    assert resolve_product_id("Ghee") == "prod_ghee"
    assert resolve_product_id("atta") == "prod_atta"
    assert resolve_product_id("rice") == "prod_rice"
    assert resolve_product_id("sugar") == "prod_sugar"

    # Test direct lookup via alias
    insight = get_product_insight("besan")
    assert insight is not None
    assert insight["product_id"] == "prod_besan"


def test_non_existent_product():
    assert get_product_insight("non_existent_sku_999") is None
    assert get_product_forecast("non_existent_sku_999") is None
    assert get_product_recommendation("non_existent_sku_999") is None


def test_all_recommendations_enrichment():
    recs = get_all_recommendations()
    assert len(recs) == 6
    for r in recs:
        assert "planning_statement" in r
        assert r["planning_statement"].startswith("Review procurement for approximately")
        assert "product_name" in r
        assert r["priority"] in ["HIGH", "MEDIUM", "LOW"]


def test_aiml_summary():
    summary = get_aiml_summary()
    assert summary["status"] == "active"
    assert summary["products_count"] == 6
    assert summary["high_priority_count"] == 3  # Besan, Dry Fruits, Ghee
    assert summary["medium_priority_count"] == 3  # Atta, Rice, Sugar
    assert summary["total_recommended_procurement_kg"] == 1149.0
    assert summary["model_artifact_present"] is True


if __name__ == "__main__":
    print("Running AIML Engine unit tests manually...")
    test_load_forecast_schema_and_size()
    print("[PASS] test_load_forecast_schema_and_size")
    test_load_recommendations_count()
    print("[PASS] test_load_recommendations_count")
    test_load_features()
    print("[PASS] test_load_features")
    test_besan_grounded_metrics()
    print("[PASS] test_besan_grounded_metrics")
    test_product_alias_resolution()
    print("[PASS] test_product_alias_resolution")
    test_non_existent_product()
    print("[PASS] test_non_existent_product")
    test_all_recommendations_enrichment()
    print("[PASS] test_all_recommendations_enrichment")
    test_aiml_summary()
    print("[PASS] test_aiml_summary")
    print("ALL 8 AIML UNIT TESTS PASSED!")
