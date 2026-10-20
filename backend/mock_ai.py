"""Compatibility adapter: FastAPI Copilot route -> verified deterministic Copilot engine."""

from __future__ import annotations

from typing import Any, Dict
from datetime import datetime
import os

from backend.verified_copilot import get_copilot_response as _verified_response


def _metric(label: str, value: Any) -> dict:
    return {"label": label, "value": str(value)}


def _adapt(result: dict) -> dict:
    intent = result.get("intent", "UNKNOWN")
    answer = result.get("answer", "")
    metrics = []
    actions = []
    table = None
    why = []

    if intent == "FORECAST":
        rec = result.get("recommendation") or {}
        metrics = [
            _metric("BASE DEMAND", f"{rec.get('base_7_day_demand_kg', 0):.2f} kg"),
            _metric("ADJUSTED DEMAND", f"~{rec.get('adjusted_7_day_demand_kg', 0):.1f} kg"),
            _metric("CURRENT STOCK", f"{rec.get('current_inventory_kg', 0):.0f} kg"),
            _metric("INCOMING PO", f"{rec.get('incoming_po_kg', 0):.0f} kg"),
            _metric("MARKET SIGNAL", f"+{rec.get('market_signal_pct', 0):.0f}%"),
            _metric("FESTIVAL EFFECT", f"+{rec.get('festival_signal_pct', 0):.0f}%"),
            _metric("PRIORITY", rec.get('priority', 'UNKNOWN')),
            _metric("RECOMMENDATION", rec.get('planning_statement', f"Review procurement for approximately {rec.get('recommended_additional_stock_kg', 0):.0f} kg additional stock.")),
        ]
        forecast = result.get("forecast") or []
        if forecast:
            rows=[]
            for row in forecast:
                rows.append({
                    "Date": row.get("date",""),
                    "Product": row.get("product_name", row.get("product_id","")),
                    "Base Predicted": f"{float(row.get('predicted_demand',0)):.1f} kg",
                    "Market Signal": f"+{float(row.get('market_signal',0))*100:.0f}%",
                    "Festival Adj": f"+{float(row.get('event_adjustment',0))*100:.1f}%",
                    "Adjusted Demand (kg)": f"{float(row.get('adjusted_demand',0)):.1f} kg",
                })
            table={"headers": list(rows[0].keys()), "rows": rows}
        why=[
            f"Base 7-day demand: {rec.get('base_7_day_demand_kg',0):.2f} kg (LightGBM forecast).",
            f"External market signal uplift: +{rec.get('market_signal_pct',0):.0f}%.",
            f"Upcoming festival signal uplift: +{rec.get('festival_signal_pct',0):.0f}%.",
            f"Current warehouse stock: {rec.get('current_inventory_kg',0):.0f} kg | Open purchase order: {rec.get('incoming_po_kg',0):.0f} kg.",
            f"Strict planning wording: {rec.get('planning_statement', '')}",
        ]
        actions=[{"label":"Review Procurement", "action":"NAVIGATE", "target":"/procurement-reconciliation?tab=purchase-requisitions"}, {"label":"View 7-Day Trajectory", "action":"NAVIGATE", "target":"/market-intelligence"}]
    elif intent == "COMPLIANCE":
        if "due" in answer.lower() or "gstr" in answer.lower():
            tasks = result.get("sources", [{}])[0]
            due_raw = str(tasks.get("due_date", "2026-10-01"))
            try:
                due_display = datetime.strptime(due_raw[:10], "%Y-%m-%d").strftime("%d %B %Y")
            except ValueError:
                due_display = due_raw
            days_left = tasks.get("days_left")
            status = tasks.get("status", "pending")
            anchor_date = tasks.get("reference_date", os.getenv("UDYAM_DEMO_DATE", "2026-09-26"))
            system_date = tasks.get("system_date", "Not available")
            system_due_status = tasks.get("system_due_status", "Not available")
            task_type = tasks.get("task_type", tasks.get("type", "GSTR-3B"))
            demo_countdown = f"{days_left} days (demo)" if days_left is not None else "Not available"
            metrics=[
                _metric("FILING FORM", str(task_type)),
                _metric("SAVED DUE DATE", due_display),
                _metric("DAYS FROM DEMO DATE", demo_countdown),
                _metric("STATUS AS OF SYSTEM DATE", system_due_status),
                _metric("TASK STATUS", str(status).title()),
            ]
            why=[
                "Personalized seeded compliance record retrieved from compliance_tasks.csv; not a live GST portal lookup.",
                f"Demo reference date: {anchor_date} | Saved due date: {due_display}.",
                f"Backend system date: {system_date}; relative status of the saved due date: {system_due_status}.",
                "Only the saved task is available; no newer upcoming due-date record is inferred.",
            ]
            actions=[{"label":"Open GST Assistant", "action":"NAVIGATE", "target":"/compliance?tab=gst"}]
        else:
            why=["Compliance knowledge answer is returned only when the connected RAG source meets the configured trust threshold."]
    elif intent == "NOTIFICATION":
        ns=result.get("notifications") or []
        high=sum(1 for n in ns if str(n.get('priority','')).upper()=='HIGH')
        medium=sum(1 for n in ns if str(n.get('priority','')).upper()=='MEDIUM')
        low=sum(1 for n in ns if str(n.get('priority','')).upper()=='LOW')
        unread=sum(1 for n in ns if not n.get('is_read',False))
        metrics=[_metric("TOTAL NOTIFICATIONS", len(ns)), _metric("UNREAD ALERTS", unread), _metric("HIGH PRIORITY", high), _metric("MEDIUM PRIORITY", medium), _metric("LOW PRIORITY", low)]
        why=[f"Authoritative feed loaded from notifications.csv ({len(ns)} records).", f"{high} High-priority notification(s) require review.", "Includes festive market, Besan procurement and GSTR-3B compliance alerts."]
        actions=[{"label":"Open Notification Center", "action":"NAVIGATE", "target":"/notifications"}]
    elif intent == "BUSINESS":
        inv = result.get("inventory", {})
        pos = result.get("purchase_orders") or []
        recommendations = result.get("recommendations") or []

        if result.get("horizon_unavailable"):
            metrics = [
                _metric("REQUESTED HORIZON", result.get("requested_horizon", "Not available")),
                _metric("AVAILABLE PLAN", result.get("available_horizon", "Not available")),
                _metric("MONTHLY RECOMMENDATION", "Not available"),
            ]
            why = [
                "The saved planning artifact only covers a 7-day horizon.",
                "Monthly quantities are not inferred by multiplying or relabelling 7-day values.",
                "A validated monthly forecast and reorder policy are required before making monthly stock recommendations.",
            ]
        elif isinstance(inv, dict):
            # Product-specific stock lookup.
            stock = inv.get("current_stock")
            incoming = sum(float(p.get("quantity", 0) or 0) for p in pos)
            stock_label = f"{stock:.0f} kg" if stock is not None else "Not available"
            metrics = [
                _metric("CURRENT STOCK", stock_label),
                _metric("INCOMING PO", f"{incoming:.0f} kg"),
            ]
            why = [
                "Current stock is read from backend/verified_data/inventory.csv.",
                "Incoming purchase-order quantity is read from backend/verified_data/purchase_orders.csv.",
            ]
        elif recommendations:
            # Portfolio-level reorder lookup. Never interpret a list of
            # inventory rows as a single stock value (the former bug showed 0 kg).
            high_count = sum(
                1 for rec in recommendations
                if str(rec.get("priority", "")).upper() == "HIGH"
            )
            metrics = [
                _metric("PRODUCTS REVIEWED", len(recommendations)),
                _metric("HIGH PRIORITY", high_count),
                _metric("PO RECORDS", len(pos)),
                _metric("FORECAST HORIZON", "7 days"),
            ]
            rows = []
            for rec in recommendations:
                stock = rec.get("current_inventory_kg")
                incoming = rec.get("incoming_po_kg")
                additional = rec.get("recommended_additional_stock_kg")
                rows.append({
                    "Product": rec.get("product_name", rec.get("product_id", "Unknown")),
                    "Priority": str(rec.get("priority", "UNKNOWN")).upper(),
                    "Base 7-Day Demand": f"{float(rec.get('base_7_day_demand_kg') or 0):.1f} kg",
                    "Adjusted 7-Day Demand": f"{float(rec.get('adjusted_7_day_demand_kg') or 0):.1f} kg",
                    "Current Stock": f"{float(stock):.0f} kg" if stock is not None else "Not available",
                    "Incoming PO": f"{float(incoming or 0):.0f} kg",
                    "Suggested Additional": f"{float(additional or 0):.0f} kg",
                })
            table = {"headers": list(rows[0].keys()), "rows": rows} if rows else None
            why = [
                "Current stock is reconciled from backend/verified_data/inventory.csv.",
                "Incoming quantities exclude purchase orders marked cancelled, closed, received, or completed.",
                "Demand, priority, and suggested additional-stock values come from the saved 7-day planning artifact backend/aiml/udyam_recommendations.json; they are not recomputed for each chat message.",
                "The saved additional-stock quantities should be checked against the business reorder policy before an order is placed.",
            ]
        else:
            inventory_rows = inv if isinstance(inv, list) else []
            metrics = [
                _metric("INVENTORY SKUS", len(inventory_rows)),
                _metric("PO RECORDS", len(pos)),
            ]
            why = [
                "Inventory and purchase-order records were found, but no saved recommendation data was available."
            ]

        if result.get("horizon_unavailable"):
            actions = [
                {"label": "View Available 7-Day Reorder Plan", "action": "NAVIGATE", "target": "/procurement-reconciliation?tab=purchase-requisitions"},
            ]
        else:
            actions = [
                {"label": "Review Purchase Orders", "action": "NAVIGATE", "target": "/procurement-reconciliation?tab=purchase-orders"},
                {"label": "Review Reorder Plan", "action": "NAVIGATE", "target": "/procurement-reconciliation?tab=purchase-requisitions"},
            ]
    elif intent == "MARKET":
        mc=result.get("market_context") or []
        metrics=[_metric("MARKET SIGNALS", len(mc))]
        why=["Market signals are read from the connected market_signals.csv feed."]
        actions=[{"label":"Open Market Radar", "action":"NAVIGATE", "target":"/market-intelligence"}]

    confidence_map={"high":95,"medium":85,"low":60}
    return {
        "query": result.get("query", ""),
        "category": intent,
        "direct_answer": answer,
        "metrics_summary": metrics,
        "structured_table": table,
        "why_recommendation": why,
        "actions": actions,
        "confidence_score": confidence_map.get(str(result.get('confidence','low')).lower(), 60),
    }


def query_udyam_ai(user_query: str, dataset: Dict[str, Any] | None = None) -> dict:
    return _adapt(_verified_response(user_query))
