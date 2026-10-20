"""
UDYAM AI — Product Repository
Manages tenant inventory, SKU catalog, and pricing data via Supabase with offline fallback.
"""

import logging
from typing import Optional, List, Dict, Any
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured
from backend.demo_data import get_initial_demo_data

logger = logging.getLogger("udyam.repo.product")


class ProductRepository:
    def __init__(self):
        self._fallback_data = get_initial_demo_data()

    def get_products(self, business_id: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured() or not business_id or business_id.startswith("00000000"):
            return self._fallback_data["products"]

        try:
            res = client.table("products").select("*").eq("business_id", business_id).order("sku_code").execute()
            rows = res.data or []
            if not rows:
                return self._fallback_data["products"]

            # Map database columns back to application product schema
            mapped = []
            for r in rows:
                mapped.append({
                    "id": r.get("id"),
                    "name": r.get("name"),
                    "sku": r.get("sku_code"),
                    "category": r.get("category", "General"),
                    "stock": r.get("stock", 0),
                    "cost_price": float(r.get("cost_price", 0)),
                    "selling_price": float(r.get("selling_price", 0)),
                    "avg_daily_sales": float(r.get("avg_daily_sales", 0)),
                    "days_remaining": float(r.get("days_remaining", 0)) if r.get("days_remaining") is not None else None,
                    "status": r.get("status", "Healthy"),
                    "forecast_demand_30d": r.get("forecast_demand_30d", 0),
                    "suggested_reorder": r.get("suggested_reorder", 0),
                    "sales_growth_30d": float(r.get("sales_growth_30d", 0)),
                    "margin_pct": float(r.get("margin_pct", 0)),
                })
            return mapped
        except Exception as e:
            logger.warning(f"Error fetching products for business {business_id}: {e}")
            return self._fallback_data["products"]

    def upsert_product(self, business_id: str, p: Dict[str, Any]) -> Dict[str, Any]:
        client = get_supabase_optional()
        sku = p.get("sku") or p.get("sku_code") or "SKU-UNKNOWN"

        cost_p = float(p.get("cost_price", 0))
        sell_p = float(p.get("selling_price", 0))
        margin = p.get("margin_pct")
        if margin is None and sell_p > 0:
            margin = round(((sell_p - cost_p) / sell_p) * 100, 1)

        avg_sales = float(p.get("avg_daily_sales", 1))
        stock = int(p.get("stock", 0))
        days_rem = p.get("days_remaining")
        if days_rem is None and avg_sales > 0:
            days_rem = round(stock / avg_sales, 1)

        record = {
            "business_id": business_id,
            "sku_code": sku,
            "name": p.get("name", "Product"),
            "category": p.get("category", "General"),
            "stock": stock,
            "cost_price": cost_p,
            "selling_price": sell_p,
            "avg_daily_sales": avg_sales,
            "days_remaining": days_rem,
            "status": p.get("status", "Healthy"),
            "forecast_demand_30d": int(p.get("forecast_demand_30d", avg_sales * 30)),
            "suggested_reorder": int(p.get("suggested_reorder", 0)),
            "sales_growth_30d": float(p.get("sales_growth_30d", 0)),
            "margin_pct": float(margin or 0),
        }

        if not client or not is_supabase_configured() or business_id.startswith("00000000"):
            return record

        try:
            res = client.table("products").upsert(record, on_conflict="business_id,sku_code").execute()
            if res.data:
                return res.data[0]
            return record
        except Exception as e:
            logger.error(f"Error upserting product in Supabase: {e}")
            return record
