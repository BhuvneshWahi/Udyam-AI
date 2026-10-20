"""Deterministic planning baseline for legacy multi-horizon dashboard views.

This is NOT the trained LightGBM model. The validated 7-day LightGBM artifacts are
served by backend/aiml/forecast_engine.py. The current portfolio engine uses seeded
rates/signals for illustrative planning estimates and emits no calibrated accuracy score.
"""

from typing import Any, Dict


def run_demand_forecast(dataset: Dict[str, Any], horizon_days: int = 30) -> Dict[str, Any]:
    """Generate transparent planning estimates for the non-core portfolio dashboard."""
    products = dataset.get("products", [])
    forecast_results = []

    for product in products:
        product_id = product.get("product_id")
        base_7d = product.get("base_7_day_demand_kg")
        if base_7d is not None:
            base_daily_rate = max(float(base_7d), 0.0) / 7.0
        else:
            base_daily_rate = max(float(product.get("avg_daily_sales", 0) or 0), 0.0)

        current_stock = max(float(product.get("stock", 0) or 0), 0.0)
        lead_time = max(int(product.get("lead_time_days", 4) or 4), 1)
        market_pct = float(product.get("market_signal_pct", product.get("sales_growth_30d", 0)) or 0)
        adjusted_daily_rate = base_daily_rate * (1.0 + market_pct / 100.0)
        forecast_demand = round(adjusted_daily_rate * max(horizon_days, 1), 1)
        days_remaining = round(current_stock / adjusted_daily_rate, 1) if adjusted_daily_rate > 0 else None

        # A transparent buffer heuristic, not a statistically estimated safety interval.
        safety_stock = round(adjusted_daily_rate * lead_time * 0.3)
        suggested_order = max(round(forecast_demand + safety_stock - current_stock), 0)
        urgency = "High" if days_remaining is not None and days_remaining <= lead_time + 1 else (
            "Medium" if days_remaining is not None and days_remaining <= 10 else "Low"
        )

        forecast_results.append({
            "sku": product.get("sku", product.get("name", "SKU-UNKNOWN")),
            "name": product.get("name", "Product"),
            "category": product.get("category", "General"),
            "current_stock": current_stock,
            "unit": product.get("unit", "kg"),
            "planning_daily_rate": round(adjusted_daily_rate, 2),
            "horizon_days": max(horizon_days, 1),
            "forecast_demand": forecast_demand,
            "prediction_interval": None,
            "suggested_reorder": suggested_order,
            "days_stock_remaining": days_remaining,
            "supplier_lead_time_days": lead_time,
            "stockout_urgency": urgency,
            "model_metrics": {
                "algorithm": "Deterministic planning heuristic (illustrative; not LightGBM)",
                "mae_units": None,
                "wape_pct": None,
                "confidence_score": None,
            },
            "data_status": "Illustrative estimate; review against current stock and purchase orders.",
        })

    return {
        "forecasts": forecast_results,
        "methodology_summary": (
            "Illustrative deterministic portfolio baseline using seeded 7-day forecasts, market signals, "
            "and a simple lead-time buffer. It is not a calibrated 30-day/90-day ML model."
        ),
        "data_sufficiency_status": (
            "The repository does not include a complete 12-month historical transaction ledger. "
            "Use backend/aiml/forecast_engine.py for the validated seeded 7-day LightGBM forecast."
        ),
    }
