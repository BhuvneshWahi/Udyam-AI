"""Seeded UDYAM AI demo data.

The six product identities, stock quantities, forecast totals, market signals,
compliance due dates and notifications are loaded from backend/verified_data.
Prices, revenue history, and customer aggregates are illustrative demo fixtures;
they are not a real business's ledger and must not be treated as verified records.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent / "verified_data"
DEMO_DATE = pd.Timestamp("2026-09-26")

# Clearly illustrative per-kg prices used only by the broader demo dashboards.
# They are not included in the canonical verified CSV data.
ILLUSTRATIVE_PRICES = {
    "prod_besan": (60.0, 85.0),
    "prod_rice": (42.0, 58.0),
    "prod_atta": (28.0, 40.0),
    "prod_ghee": (510.0, 640.0),
    "prod_sugar": (36.0, 46.0),
    "prod_dryfr": (480.0, 650.0),
}
UI_PRODUCT_IDS = {
    "prod_besan": "PROD-101",
    "prod_rice": "PROD-102",
    "prod_atta": "PROD-103",
    "prod_ghee": "PROD-104",
    "prod_sugar": "PROD-105",
    "prod_dryfr": "PROD-106",
}
LEAD_TIMES = {
    "prod_besan": 3,
    "prod_rice": 4,
    "prod_atta": 4,
    "prod_ghee": 4,
    "prod_sugar": 4,
    "prod_dryfr": 4,
}


def _read_csv(filename: str) -> List[Dict[str, str]]:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Required seeded demo data file is missing: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _read_json(filename: str) -> Dict[str, Any]:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Required seeded demo data file is missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def get_initial_demo_data() -> Dict[str, Any]:
    """Return a schema-compatible demo profile grounded in the canonical seed files."""
    vendor_rows = _read_csv("vendors.csv")
    product_rows = _read_csv("products.csv")
    inventory_rows = _read_csv("inventory.csv")
    recommendation_payload = _read_json("udyam_recommendations.json")
    compliance_rows = _read_csv("compliance_tasks.csv")
    event_rows = _read_csv("events.csv")
    signal_rows = _read_csv("market_signals.csv")

    vendor = next(
        (row for row in vendor_rows if row.get("vendor_id") == "vendor_sharma_001"),
        vendor_rows[0] if vendor_rows else {},
    )
    inventory = {row["product_id"]: row for row in inventory_rows}
    recommendations = {
        row["product_id"]: row
        for row in recommendation_payload.get("recommendations", [])
    }
    signals_by_product: Dict[str, float] = {
        "prod_besan": 14.0,
        "prod_rice": 3.0,
        "prod_atta": 3.0,
        "prod_ghee": 14.0,
        "prod_sugar": 3.0,
        "prod_dryfr": 9.0,
    }

    products: List[Dict[str, Any]] = []
    forecasts: List[Dict[str, Any]] = []
    for product in product_rows:
        product_id = product["id"]
        stock_record = inventory.get(product_id, {})
        rec = recommendations.get(product_id, {})
        stock = float(stock_record.get("current_qty", 0) or 0)
        base_7d = float(rec.get("base_7_day_demand_kg", 0) or 0)
        adjusted_7d = float(rec.get("adjusted_7_day_demand_kg", base_7d) or 0)
        incoming_po = float(rec.get("incoming_po_kg", 0) or 0)
        recommended = float(rec.get("recommended_additional_stock_kg", 0) or 0)
        priority = str(rec.get("priority", "LOW")).upper()
        cost_price, selling_price = ILLUSTRATIVE_PRICES.get(product_id, (0.0, 0.0))
        projected_daily_rate = adjusted_7d / 7.0 if adjusted_7d > 0 else 0.0
        days_remaining = round(stock / projected_daily_rate, 1) if projected_daily_rate > 0 else 0.0
        margin_pct = round(((selling_price - cost_price) / selling_price) * 100, 1) if selling_price > 0 else 0.0
        risk_level = "Critical" if priority == "HIGH" else "Low" if priority == "MEDIUM" else "Healthy"
        ui_id = UI_PRODUCT_IDS.get(product_id, product_id)
        lead_time = LEAD_TIMES.get(product_id, 4)
        signal_pct = signals_by_product.get(product_id, 0.0)
        forecast_30d = round(adjusted_7d / 7.0 * 30.0)

        products.append({
            "id": ui_id,
            "product_id": product_id,
            "name": product["name"],
            "sku": product.get("sku", product["name"].upper().replace(" ", "-")),
            "category": product.get("category", "General"),
            "stock": stock,
            "unit": stock_record.get("unit", "kg"),
            "cost_price": cost_price,
            "selling_price": selling_price,
            # This is a projected planning rate derived from the seeded adjusted 7-day forecast,
            # not independently verified historical daily sales.
            "avg_daily_sales": round(projected_daily_rate, 2),
            "days_remaining": days_remaining,
            "status": risk_level,
            "forecast_demand_30d": forecast_30d,
            "suggested_reorder": int(round(recommended)),
            "sales_growth_30d": signal_pct,
            "margin_pct": margin_pct,
            "lead_time_days": lead_time,
            "incoming_po_kg": incoming_po,
            "base_7_day_demand_kg": base_7d,
            "adjusted_7_day_demand_kg": adjusted_7d,
            "market_signal_pct": signal_pct,
            "priority": priority,
            "price_data_status": "illustrative demo estimate",
        })

        # Longer horizons are proportional planning extrapolations from the adjusted 7-day value;
        # they are not outputs of a separately trained 30-day or 90-day model.
        forecasts.append({
            "product_id": ui_id,
            "canonical_product_id": product_id,
            "product_name": product["name"],
            "current_stock": stock,
            "historical_7d": round(base_7d * 0.92),  # illustrative chart fixture, not canonical history
            "historical_30d": round(base_7d * 30.0 / 7.0 * 0.92),
            "forecast_7d": round(base_7d, 2),
            "forecast_30d": forecast_30d,
            "forecast_90d": round(adjusted_7d / 7.0 * 90.0),
            "confidence": 0,  # intentionally not calibrated in this legacy dashboard schema
            "risk_level": risk_level,
            "suggested_order": int(round(recommended)),
            "lead_time_days": lead_time,
            "rationale": (
                f"Seeded 7-day base forecast {base_7d:.2f} kg; adjusted demand {adjusted_7d:.2f} kg. "
                "30-day and 90-day quantities are simple planning extrapolations, not separate model outputs."
            ),
        })

    monthly_revenue = 1_842_000  # illustrative aggregate used only by non-core dashboard fixtures
    synthetic_cost_inventory = sum(p["cost_price"] * p["stock"] for p in products)
    active_compliance = {row.get("type"): row for row in compliance_rows}
    gst_task = active_compliance.get("GSTR-3B", {})
    gst_due = pd.to_datetime(gst_task.get("due_date", "2026-10-01"))
    gst_days_left = int((gst_due.normalize() - DEMO_DATE).days)
    gst_date_display = gst_due.strftime("%d %B %Y")

    compliance_filings = [
        {
            "form": "GSTR-1", "period": "August 2026", "due_date": "11 September 2026",
            "status": "Completed", "tax_amount": 0, "days_left": 0,
        },
        {
            "form": "GSTR-3B", "period": "August 2026", "due_date": gst_due.strftime("%d %B %Y"),
            "status": "Pending", "tax_amount": 0, "days_left": gst_days_left,
        },
        {
            "form": "ITR (advance tax)", "period": "Demo compliance task",
            "due_date": "04 November 2026", "status": "Upcoming", "tax_amount": 0,
            "days_left": int((pd.Timestamp("2026-11-04") - DEMO_DATE).days),
        },
    ]

    category_totals = {
        "Staples": 0.70 * monthly_revenue,
        "Festive": 0.30 * monthly_revenue,
    }
    category_performance = [
        {"category": "Staples", "revenue": round(category_totals["Staples"]), "revenue_share": 70.0, "margin_pct": 22.0, "orders": 994},
        {"category": "Festive", "revenue": round(category_totals["Festive"]), "revenue_share": 30.0, "margin_pct": 25.0, "orders": 426},
    ]

    # These vendor-level aggregates are illustrative. The verified CSV package intentionally
    # does not contain personal customer records or a complete bank/invoice ledger.
    sales_trends = [
        {"month": "Apr", "revenue": 1_420_000, "profit": 284_000, "orders": 1100},
        {"month": "May", "revenue": 1_510_000, "profit": 302_000, "orders": 1180},
        {"month": "Jun", "revenue": 1_480_000, "profit": 296_000, "orders": 1150},
        {"month": "Jul", "revenue": 1_650_000, "profit": 330_000, "orders": 1290},
        {"month": "Aug", "revenue": 1_720_000, "profit": 344_000, "orders": 1340},
        {"month": "Sep (Demo)", "revenue": monthly_revenue, "profit": round(monthly_revenue * 0.20), "orders": 1420},
    ]

    schemes = []  # Scheme eligibility/routing is not implemented as a verified engine in this snapshot.

    smart_insights = [
        {
            "id": "INS-01", "category": "Risk", "title": "Review Besan procurement before festive demand",
            "why": "Adjusted 7-day demand is about 255.8 kg against 21 kg current stock; 20 kg is incoming.",
            "supporting_data": "Base demand 186.52 kg; market signal +14%; festival effect +24%; priority HIGH.",
            "action": "Review procurement for approximately 266 kg additional Besan.", "priority": "High",
        },
        {
            "id": "INS-02", "category": "Inventory", "title": "Ghee demand signal needs stock review",
            "why": "The seeded model raises adjusted 7-day Ghee demand to about 187.7 kg.",
            "supporting_data": "Current stock 54 kg; market signal +14%; festival effect +26%; priority HIGH.",
            "action": "Review the Ghee procurement recommendation against supplier lead time.", "priority": "High",
        },
        {
            "id": "INS-03", "category": "Opportunity", "title": "Plan for the upcoming festive window",
            "why": "Dhanteras and Diwali are present in the seeded event calendar.",
            "supporting_data": "Dhanteras 11 October 2026; Diwali 13 October 2026; reference date 26 September 2026.",
            "action": "Review inventory and supplier capacity before the festive period.", "priority": "Medium",
        },
        {
            "id": "INS-04", "category": "Risk", "title": "GSTR-3B deadline is approaching in the demo scenario",
            "why": f"The seeded task is due on {gst_date_display}, {gst_days_left} days after the demo reference date.",
            "supporting_data": f"Status: {str(gst_task.get('status', 'pending')).title()}; reference date: {DEMO_DATE.strftime('%d %B %Y')}.",
            "action": "Verify the actual filing status and due date against official records.", "priority": "Medium",
        },
    ]

    daily_actions = [
        {
            "id": "ACT-101", "title": "Review Besan procurement recommendation",
            "reason": "Seeded adjusted demand is ~255.8 kg; current stock is 21 kg and 20 kg is incoming.",
            "impact": "Supports stock planning; does not trigger an automatic purchase.",
            "priority": "Critical", "action_type": "PURCHASE_PLAN", "target_product": UI_PRODUCT_IDS["prod_besan"],
        },
        {
            "id": "ACT-102", "title": "Review Ghee stock planning",
            "reason": "Seeded adjusted 7-day demand is 187.7 kg against 54 kg stock.",
            "impact": "Helps prepare for the expected festive demand window.",
            "priority": "High", "action_type": "PURCHASE_PLAN", "target_product": UI_PRODUCT_IDS["prod_ghee"],
        },
        {
            "id": "ACT-103", "title": "Verify GSTR-3B filing status",
            "reason": f"Seeded due date is {gst_date_display}; countdown is based on the demo reference date.",
            "impact": "Supports timely filing after confirmation against the actual GST account.",
            "priority": "High", "action_type": "COMPLIANCE", "target_form": "GSTR-3B",
        },
        {
            "id": "ACT-104", "title": "Review Dhanteras and Diwali stock readiness",
            "reason": "The event calendar flags two upcoming festive dates in October 2026.",
            "impact": "Encourages early review of stock and supplier lead times.",
            "priority": "Medium", "action_type": "INVENTORY_REVIEW",
        },
    ]

    return {
        "business_profile": {
            "name": vendor.get("vendor_name", "Sharma General Store"),
            "owner": "Demo Owner",
            "business_type": "Micro Enterprise (Retail)",
            "gstin": "DEMO-NOT-A-REAL-GSTIN",
            "state": "Delhi",
            "city": vendor.get("location", "Delhi"),
            "business_age_years": 4,  # illustrative demo profile field
            "employee_count": 6,  # illustrative demo profile field
            "annual_revenue": 14_500_000,  # illustrative demo profile field
            "sector": vendor.get("sector", "Grocery / Retail"),
            "preferred_language": "Hinglish",
            "ai_personalization": "Grocery retail demand forecasting, inventory planning, seeded market signals and compliance reminders.",
            "data_provenance": "Seeded demo scenario; not a live customer account.",
        },
        "kpis": {
            "today_sales": 84250,
            "today_sales_change": 14.2,
            "monthly_revenue": monthly_revenue,
            "monthly_revenue_change": 7.1,
            "gross_profit": round(monthly_revenue * 0.22),
            "profit_margin": 22.0,
            "profit_margin_pct": 22.0,
            "monthly_orders": 1420,
            "orders_change": 5.9,
            "inventory_value": round(synthetic_cost_inventory),
            "total_skus": len(products),
            "low_stock_items": sum(1 for p in products if p["status"] == "Low"),
            "critical_stock_items": sum(1 for p in products if p["status"] == "Critical"),
        },
        "products": products,
        "sales_trends": sales_trends,
        "demand_forecasts": forecasts,
        "category_performance": category_performance,
        "customers_summary": {
            "total_active_clients": 0,
            "new_clients_this_month": 0,
            "returning_clients": 0,
            "repeat_purchase_rate": 0.0,
            "top_buyers": [],
            "data_provenance": "No verified customer ledger is shipped in this demo snapshot.",
        },
        "compliance": {
            "gstin": "DEMO-NOT-A-REAL-GSTIN",
            "gst_status": "Demo profile — verify actual registration",
            "filings": compliance_filings,
            "eway_reconciliation": {
                "matched_pct": 0,
                "unmatched_bills": 0,
                "itc_claimed": 0,
                "itc_eligible": 0,
            },
            "alerts": [
                f"GSTR-3B filing due on {gst_date_display} ({gst_days_left} days remaining from the demo reference date {DEMO_DATE.strftime('%d %B %Y')})."
            ],
        },
        "schemes": schemes,
        "smart_insights": smart_insights,
        "daily_actions": daily_actions,
        "events": event_rows,
        "market_signals": signal_rows,
        "demo_reference_date": DEMO_DATE.strftime("%Y-%m-%d"),
        "data_provenance": {
            "canonical_sources": [
                "backend/verified_data/products.csv",
                "backend/verified_data/inventory.csv",
                "backend/verified_data/udyam_recommendations.json",
                "backend/verified_data/compliance_tasks.csv",
                "backend/verified_data/events.csv",
                "backend/verified_data/market_signals.csv",
            ],
            "illustrative_fields": [
                "product cost and selling prices",
                "monthly KPI and sales-history aggregates",
                "customer aggregates",
            ],
            "note": "Seeded data for software demonstration; not a real customer ledger.",
        },
    }
