
# Udyam AI — AIML Backend Integration Guide

## 1. AIML Module

Model:
- LightGBM Regressor
- Task: Demand Forecasting

Pipeline:

Historical Sales
    ↓
LightGBM Base Forecast
    ↓
Market Signal + Festival Signal
    ↓
Adjusted Demand
    ↓
Inventory + Incoming PO
    ↓
Procurement Recommendation

---

## 2. Files

forecast_engine.py
    Main backend-facing AIML module.

lightgbm_demand_model.pkl
    Trained LightGBM model artifact.

forecast_features.json
    Feature list used by the model.

forecast_output.csv
    Generated 7-day forecast for all products.

udyam_recommendations.json
    Procurement recommendations for all products.

---

## 3. Python Usage

from forecast_engine import get_product_insight

result = get_product_insight("prod_besan")

This returns:

{
    "product_id": "prod_besan",
    "forecast": [...],
    "recommendation": {...}
}

---

## 4. Forecast Object

Each forecast record contains:

date
product_id
product_name
predicted_demand
market_signal
event_adjustment
adjusted_demand

Meaning:

predicted_demand
    Base LightGBM forecast.

market_signal
    External market uplift applied to demand.

event_adjustment
    Festival/event-based demand adjustment.

adjusted_demand
    Final demand after signal fusion.

---

## 5. Recommendation Object

Fields:

product_id
base_7_day_demand_kg
market_signal_pct
festival_signal_pct
adjusted_7_day_demand_kg
current_inventory_kg
incoming_po_kg
recommended_additional_stock_kg
priority

---

## 6. Example

Request:

product_id = "prod_besan"

Example response:

{
    "product_id": "prod_besan",

    "forecast": [
        {
            "date": "2026-09-26",
            "product_id": "prod_besan",
            "product_name": "Besan",
            "predicted_demand": 31.96,
            "market_signal": 0.14,
            "event_adjustment": 0.105238,
            "adjusted_demand": 39.80
        }
    ],

    "recommendation": {
        "product_id": "prod_besan",
        "base_7_day_demand_kg": 186.52,
        "market_signal_pct": 14.0,
        "festival_signal_pct": 24.0,
        "adjusted_7_day_demand_kg": 255.8,
        "current_inventory_kg": 21.0,
        "incoming_po_kg": 20.0,
        "recommended_additional_stock_kg": 266.0,
        "priority": "HIGH"
    }
}

---

## 7. Important

The procurement quantity is a planning recommendation,
not a guaranteed purchase instruction.

The backend/UI should phrase it as:

"Review procurement for approximately 266 kg additional Besan stock."

rather than:

"Buy exactly 266 kg."

---

## 8. Current Scope

This module currently serves the generated forecast and
recommendation artifacts.

It does NOT retrain the model.

It does NOT require the Colab notebook at runtime.

The packaged AIML files must be kept in the same directory
when using forecast_engine.py.
