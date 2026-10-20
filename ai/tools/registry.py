from typing import Optional
"""
Declarative Tool Registry for UDYAM AI MSME Copilot.
Exposes deterministic domain engine tools to the reasoning agent.
"""

from typing import Dict, Any, List, Callable
from backend.services.financial_engine import calculate_financial_metrics
from backend.services.reconciliation_engine import run_reconciliation
from backend.services.forecasting_engine import run_demand_forecast
from backend.services.market_signal_engine import get_market_signals
from backend.services.festival_engine import get_upcoming_festival_intelligence
from backend.services.compliance_engine import get_compliance_status
from backend.aiml import (
    get_product_insight,
    get_product_forecast,
    get_product_recommendation,
    get_all_recommendations,
    get_aiml_summary,
    get_all_forecasts,
    resolve_product_id,
)

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._register_default_tools()

    def register(self, name: str, func: Callable):
        self._tools[name] = func

    def execute(self, tool_name: str, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        if tool_name not in self._tools:
            return {"error": f"Tool '{tool_name}' is not registered."}
        return self._tools[tool_name](dataset, **kwargs)

    def _register_default_tools(self):
        self.register("get_sales", self._tool_get_sales)
        self.register("get_inventory", self._tool_get_inventory)
        self.register("get_financial_metrics", self._tool_get_financial_metrics)
        self.register("get_forecast", self._tool_get_forecast)
        self.register("get_market_signals", self._tool_get_market_signals)
        self.register("get_festivals", self._tool_get_festivals)
        self.register("search_compliance", self._tool_search_compliance)
        self.register("get_gst_status", self._tool_get_gst_status)
        self.register("get_scheme_matches", self._tool_get_scheme_matches)
        self.register("get_gem_opportunities", self._tool_get_gem_opportunities)
        self.register("get_reconciliation", self._tool_get_reconciliation)
        self.register("analyze_agreement", self._tool_analyze_agreement)
        self.register("get_aiml_product_insight", self._tool_get_aiml_product_insight)
        self.register("get_aiml_forecast", self._tool_get_aiml_forecast)
        self.register("get_aiml_recommendations", self._tool_get_aiml_recommendations)
        self.register("get_aiml_summary", self._tool_get_aiml_summary)

    def _tool_get_sales(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return {
            "monthly_revenue": dataset.get("kpis", {}).get("monthly_revenue", 1842000),
            "yoy_growth_pct": dataset.get("kpis", {}).get("monthly_growth_pct", 18.5),
            "top_categories": dataset.get("category_performance", [])
        }

    def _tool_get_inventory(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        products = dataset.get("products", [])
        critical = [p for p in products if p.get("status") in ["Critical", "Low"]]
        return {
            "total_skus": len(products),
            "critical_stock_skus": len(critical),
            "critical_items": critical
        }

    def _tool_get_financial_metrics(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return calculate_financial_metrics(dataset)

    def _tool_get_forecast(self, dataset: Dict[str, Any], horizon_days: int = 30, **kwargs) -> Dict[str, Any]:
        return run_demand_forecast(dataset, horizon_days=horizon_days)

    def _tool_get_market_signals(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return {"signals": get_market_signals(dataset)}

    def _tool_get_festivals(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return {"festivals": get_upcoming_festival_intelligence(dataset)}

    def _tool_search_compliance(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return get_compliance_status(dataset)

    def _tool_get_gst_status(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return get_compliance_status(dataset)

    def _tool_get_scheme_matches(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return {"schemes": dataset.get("schemes", [])}

    def _tool_get_gem_opportunities(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return {
            "tenders": [
                {
                    "tender_id": "GEM-2026-T991",
                    "title": "Supply of Brass Connectors & Conduit Accessories to Ordnance Factory Nagpur",
                    "value_inr": 4500000.0,
                    "deadline": "2026-10-10",
                    "eligibility_match_pct": 94,
                    "status": "OPEN"
                }
            ]
        }

    def _tool_get_reconciliation(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return run_reconciliation(dataset)

    def _tool_analyze_agreement(self, dataset: Dict[str, Any], agreement_text: str = "", **kwargs) -> Dict[str, Any]:
        return {
            "summary": "Vendor B2B Supply Agreement with Tata Ancillary",
            "payment_terms": "Net 45 Days from invoice receipt",
            "termination_notice": "30 Days written notice",
            "penalty_clause": "0.5% per week delay capped at 5% total order value",
            "risk_flags": ["Net 45 days exceeds MSME Act 45-day statutory limit", "Uncapped indemnification liability"],
            "compatibility_matrix": "High compatibility (₹ 1.45 Cr vendor turnover vs ₹ 5.0 Cr buyer threshold)."
        }

    def _tool_get_aiml_product_insight(self, dataset: Dict[str, Any], product_id: str = "prod_besan", **kwargs) -> Dict[str, Any]:
        insight = get_product_insight(product_id)
        if not insight:
            return {"error": f"No AIML insight found for product '{product_id}'."}
        return insight

    def _tool_get_aiml_forecast(self, dataset: Dict[str, Any], product_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        if product_id:
            forecast = get_product_forecast(product_id)
            return {"product_id": product_id, "forecast": forecast or []}
        return {"forecasts": get_all_forecasts()}

    def _tool_get_aiml_recommendations(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return {"recommendations": get_all_recommendations()}

    def _tool_get_aiml_summary(self, dataset: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        return get_aiml_summary()

tool_registry = ToolRegistry()

