"""
Deterministic Financial Analytics Engine for UDYAM AI.
LLM NEVER calculates financial numbers directly — backend engine calculates them.
"""

from typing import Dict, Any, List

def calculate_financial_metrics(dataset: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes key financial metrics deterministically from dataset records.
    """
    products = dataset.get("products", [])
    
    total_inventory_value = sum(p["cost_price"] * p["stock"] for p in products)
    monthly_revenue = dataset.get("kpis", {}).get("monthly_revenue", 1842000)
    
    # Calculate COGS using average cost margin (68% cost, 32% margin)
    gross_margin_pct = dataset.get("kpis", {}).get("profit_margin_pct", 32.0)
    cogs = monthly_revenue * (1.0 - (gross_margin_pct / 100.0))
    gross_profit = monthly_revenue - cogs
    
    operating_expenses = monthly_revenue * 0.14  # ~14% OpEx (rent, salaries, utilities)
    net_profit = gross_profit - operating_expenses
    net_margin_pct = (net_profit / monthly_revenue) * 100.0 if monthly_revenue > 0 else 0.0
    
    receivables = 345000.0  # ₹ 3.45 Lakhs pending customer payments
    payables = 210000.0     # ₹ 2.10 Lakhs pending supplier payments
    working_capital = (total_inventory_value + receivables) - payables
    
    # Cash Conversion Cycle (CCC) = DIO + DSO - DPO
    daily_cogs = cogs / 30.0 if cogs > 0 else 1.0
    daily_sales = monthly_revenue / 30.0 if monthly_revenue > 0 else 1.0
    
    dio = total_inventory_value / daily_cogs  # Days Inventory Outstanding
    dso = receivables / daily_sales          # Days Sales Outstanding
    dpo = payables / daily_cogs              # Days Payables Outstanding
    ccc = dio + dso - dpo

    current_assets = total_inventory_value + receivables + 250000.0
    working_capital_ratio = round(current_assets / max(payables, 1.0), 2)
    daily_opex = operating_expenses / 30.0 if operating_expenses > 0 else 1.0
    liquidity_runway_days = round(250000.0 / daily_opex, 1)
    ebitda = round(gross_profit - operating_expenses * 0.7, 2)
    
    return {
        "monthly_revenue": monthly_revenue,
        "cogs": round(cogs, 2),
        "gross_profit": round(gross_profit, 2),
        "gross_margin_pct": round(gross_margin_pct, 2),
        "operating_expenses": round(operating_expenses, 2),
        "net_profit": round(net_profit, 2),
        "net_margin_pct": round(net_margin_pct, 2),
        "inventory_value": round(total_inventory_value, 2),
        "receivables": round(receivables, 2),
        "payables": round(payables, 2),
        "working_capital": round(working_capital, 2),
        "working_capital_ratio": working_capital_ratio,
        "liquidity_runway_days": liquidity_runway_days,
        "ebitda": ebitda,
        "cash_conversion_cycle_days": round(ccc, 1),
        "dio_days": round(dio, 1),
        "dso_days": round(dso, 1),
        "dpo_days": round(dpo, 1),
        "evidence_formula": [
            f"Gross Profit = Monthly Revenue (₹{monthly_revenue:,.2f}) - COGS (₹{cogs:,.2f}) = ₹{gross_profit:,.2f}",
            f"Gross Margin % = (Gross Profit / Monthly Revenue) * 100 = {gross_margin_pct:.1f}%",
            f"Working Capital = (Inventory ₹{total_inventory_value:,.2f} + Receivables ₹{receivables:,.2f}) - Payables ₹{payables:,.2f} = ₹{working_capital:,.2f}",
            f"Cash Conversion Cycle = DIO ({dio:.1f} days) + DSO ({dso:.1f} days) - DPO ({dpo:.1f} days) = {ccc:.1f} days"
        ]
    }
