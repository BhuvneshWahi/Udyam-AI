from pathlib import Path
import json
from typing import Optional, Dict, Any, List
import pandas as pd

# All AIML artifacts are located in this directory
ARTIFACT_DIR = Path(__file__).resolve().parent
FORECAST_PATH = ARTIFACT_DIR / "forecast_output.csv"
RECOMMENDATIONS_PATH = ARTIFACT_DIR / "udyam_recommendations.json"
FEATURES_PATH = ARTIFACT_DIR / "forecast_features.json"
MODEL_PATH = ARTIFACT_DIR / "lightgbm_demand_model.pkl"

PRODUCT_NAME_MAP = {
    "prod_atta": "Atta",
    "prod_besan": "Besan",
    "prod_dryfr": "Dry Fruits",
    "prod_ghee": "Ghee",
    "prod_rice": "Rice",
    "prod_sugar": "Sugar"
}

PRODUCT_ALIAS_MAP = {
    "prod_atta": "prod_atta",
    "atta": "prod_atta",
    "wheat": "prod_atta",
    "wheat flour": "prod_atta",
    "prod_besan": "prod_besan",
    "besan": "prod_besan",
    "gram flour": "prod_besan",
    "chana besan": "prod_besan",
    "prod_dryfr": "prod_dryfr",
    "dryfr": "prod_dryfr",
    "dry fruits": "prod_dryfr",
    "dryfruits": "prod_dryfr",
    "dry_fruits": "prod_dryfr",
    "kaju badam": "prod_dryfr",
    "prod_ghee": "prod_ghee",
    "ghee": "prod_ghee",
    "desi ghee": "prod_ghee",
    "pure ghee": "prod_ghee",
    "prod_rice": "prod_rice",
    "rice": "prod_rice",
    "chawal": "prod_rice",
    "basmati": "prod_rice",
    "prod_sugar": "prod_sugar",
    "sugar": "prod_sugar",
    "cheeni": "prod_sugar"
}


def resolve_product_id(query_id: str) -> Optional[str]:
    """Normalize input string to canonical product ID (e.g. 'besan' -> 'prod_besan')."""
    if not query_id:
        return None
    clean = query_id.lower().strip().replace("-", "_")
    if clean in PRODUCT_ALIAS_MAP:
        return PRODUCT_ALIAS_MAP[clean]
    for key, canonical in PRODUCT_ALIAS_MAP.items():
        if key in clean or clean in key:
            return canonical
    return None


def load_forecast() -> pd.DataFrame:
    """Load the generated 7-day demand forecast."""
    if not FORECAST_PATH.exists():
        raise FileNotFoundError(f"Forecast file not found: {FORECAST_PATH}")

    df = pd.read_csv(FORECAST_PATH)
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
    return df


def load_recommendations() -> Dict[str, Any]:
    """Load procurement recommendations."""
    if not RECOMMENDATIONS_PATH.exists():
        raise FileNotFoundError(f"Recommendation file not found: {RECOMMENDATIONS_PATH}")

    with open(RECOMMENDATIONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_features() -> List[str]:
    """Load the 23 features schema used by the LightGBM model."""
    if not FEATURES_PATH.exists():
        return []
    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _enrich_recommendation(item: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich recommendation item with product name, planning language, and status metrics."""
    enriched = dict(item)
    pid = item.get("product_id", "")
    pname = PRODUCT_NAME_MAP.get(pid, pid.replace("prod_", "").title())
    enriched["product_name"] = pname
    
    qty = enriched.get("recommended_additional_stock_kg", 0)
    qty_int = int(round(qty))
    enriched["planning_statement"] = (
        f"Review procurement for approximately {qty_int} kg additional {pname} stock."
    )
    return enriched


def get_product_forecast(product_id: str) -> Optional[List[Dict[str, Any]]]:
    """Return the 7-day forecast for one product."""
    canonical_id = resolve_product_id(product_id) or product_id
    try:
        df = load_forecast()
    except Exception:
        return None

    result = df[df["product_id"] == canonical_id].copy()
    if result.empty:
        return None

    result["date"] = result["date"].dt.strftime("%Y-%m-%d")
    return result.to_dict(orient="records")


def get_product_recommendation(product_id: str) -> Optional[Dict[str, Any]]:
    """Return procurement recommendation for one product."""
    canonical_id = resolve_product_id(product_id) or product_id
    try:
        data = load_recommendations()
    except Exception:
        return None

    for item in data.get("recommendations", []):
        if item.get("product_id") == canonical_id:
            return _enrich_recommendation(item)

    return None


def get_product_insight(product_id: str) -> Optional[Dict[str, Any]]:
    """
    Combined AIML response containing:
    - 7-day forecast
    - market signal
    - festival signal
    - adjusted demand
    - procurement recommendation
    """
    canonical_id = resolve_product_id(product_id) or product_id
    forecast = get_product_forecast(canonical_id)
    recommendation = get_product_recommendation(canonical_id)

    if forecast is None and recommendation is None:
        return None

    pname = PRODUCT_NAME_MAP.get(canonical_id, canonical_id.replace("prod_", "").title())
    
    return {
        "product_id": canonical_id,
        "product_name": pname,
        "forecast": forecast or [],
        "recommendation": recommendation,
        "planning_statement": recommendation.get("planning_statement") if recommendation else None
    }


def get_all_recommendations() -> List[Dict[str, Any]]:
    """Return enriched recommendations for all products."""
    data = load_recommendations()
    return [_enrich_recommendation(item) for item in data.get("recommendations", [])]


def get_all_forecasts() -> List[Dict[str, Any]]:
    """Return all 7-day forecasts as formatted records."""
    df = load_forecast()
    if "date" in df.columns:
        df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    return df.to_dict(orient="records")


def get_aiml_summary() -> Dict[str, Any]:
    """
    High-level overview of AIML engine status, artifacts, and product demand health.
    """
    recommendations = get_all_recommendations()
    high_priority = [r for r in recommendations if r.get("priority") == "HIGH"]
    med_priority = [r for r in recommendations if r.get("priority") == "MEDIUM"]

    total_rec_stock = sum(r.get("recommended_additional_stock_kg", 0) for r in recommendations)
    total_adjusted_demand = sum(r.get("adjusted_7_day_demand_kg", 0) for r in recommendations)

    return {
        "status": "active",
        "engine": "LightGBM Demand Regressor (UDYAM AI AIML)",
        "horizon": "7-day rolling forecast",
        "products_count": len(recommendations),
        "high_priority_count": len(high_priority),
        "medium_priority_count": len(med_priority),
        "total_recommended_procurement_kg": round(total_rec_stock, 1),
        "total_adjusted_7_day_demand_kg": round(total_adjusted_demand, 1),
        "features_count": len(load_features()),
        "model_artifact_present": MODEL_PATH.exists(),
        "recommendations": recommendations
    }
