import { BusinessProfile, KPIs, Product, SalesTrend, DemandForecast, CategoryPerformance, ComplianceData, GovernmentScheme, SmartInsight, DailyAction, CopilotResponse } from '../types';

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: "Sharma General Store",
  owner: "Demo Owner",
  business_type: "Micro Enterprise (Retail)",
  gstin: "DEMO-NOT-A-REAL-GSTIN",
  state: "Delhi",
  city: "Delhi",
  business_age_years: 4,
  employee_count: 6,
  annual_revenue: 22104000,
  sector: "Grocery & Retail",
  preferred_language: "Hinglish",
  ai_personalization: "Grocery retail demand forecasting, inventory planning, seeded market signals and compliance reminders."
};

// Aggregated KPIs and price/margin fields below are illustrative demo fixtures.
// Stock, product names, 7-day forecasts, priorities and recommendations are taken
// from backend/verified_data and its recommendation artifacts.
export const INITIAL_KPIS: KPIs = {
  today_sales: 84250,
  today_sales_change: 7.1,
  monthly_revenue: 1842000,
  monthly_revenue_change: 7.1,
  gross_profit: 405240,
  profit_margin: 22.0,
  monthly_orders: 1420,
  orders_change: 5.9,
  inventory_value: 62295,
  total_skus: 6,
  low_stock_items: 3,
  critical_stock_items: 3
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "PROD-101", name: "Besan", sku: "BESAN", category: "Festive",
    stock: 21, cost_price: 60, selling_price: 85, avg_daily_sales: 36.54,
    days_remaining: 0.6, status: "Critical", forecast_demand_30d: 1096,
    suggested_reorder: 266, sales_growth_30d: 14, margin_pct: 29.4
  },
  {
    id: "PROD-102", name: "Rice", sku: "RICE", category: "Staples",
    stock: 263, cost_price: 42, selling_price: 58, avg_daily_sales: 59.37,
    days_remaining: 4.4, status: "Low", forecast_demand_30d: 1781,
    suggested_reorder: 236, sales_growth_30d: 3, margin_pct: 27.6
  },
  {
    id: "PROD-103", name: "Atta", sku: "ATTA", category: "Staples",
    stock: 258, cost_price: 28, selling_price: 40, avg_daily_sales: 57.89,
    days_remaining: 4.5, status: "Low", forecast_demand_30d: 1737,
    suggested_reorder: 228, sales_growth_30d: 3, margin_pct: 30.0
  },
  {
    id: "PROD-104", name: "Ghee", sku: "GHEE", category: "Festive",
    stock: 54, cost_price: 510, selling_price: 640, avg_daily_sales: 26.81,
    days_remaining: 2.0, status: "Critical", forecast_demand_30d: 804,
    suggested_reorder: 171, sales_growth_30d: 14, margin_pct: 20.3
  },
  {
    id: "PROD-105", name: "Sugar", sku: "SUGAR", category: "Staples",
    stock: 180, cost_price: 36, selling_price: 46, avg_daily_sales: 38.19,
    days_remaining: 4.7, status: "Low", forecast_demand_30d: 1146,
    suggested_reorder: 141, sales_growth_30d: 3, margin_pct: 21.7
  },
  {
    id: "PROD-106", name: "Dry Fruits", sku: "DRYFR", category: "Festive",
    stock: 18, cost_price: 480, selling_price: 650, avg_daily_sales: 14.89,
    days_remaining: 1.2, status: "Critical", forecast_demand_30d: 447,
    suggested_reorder: 107, sales_growth_30d: 9, margin_pct: 26.2
  }
];

// Non-core dashboard history is illustrative. The authoritative trained model
// artifacts in backend/aiml provide the seeded 7-day forecast.
export const INITIAL_SALES_TRENDS: SalesTrend[] = [
  { month: "Apr", revenue: 1420000, profit: 284000, orders: 1100 },
  { month: "May", revenue: 1510000, profit: 302000, orders: 1180 },
  { month: "Jun", revenue: 1480000, profit: 296000, orders: 1150 },
  { month: "Jul", revenue: 1650000, profit: 330000, orders: 1290 },
  { month: "Aug", revenue: 1720000, profit: 344000, orders: 1340 },
  { month: "Sep (Demo)", revenue: 1842000, profit: 405240, orders: 1420 }
];

export const INITIAL_DEMAND_FORECASTS: DemandForecast[] = [
  {
    product_id: "PROD-101", product_name: "Besan", current_stock: 21,
    historical_7d: 170, historical_30d: 720, forecast_7d: 186.52,
    forecast_30d: 1096, forecast_90d: 3290, confidence: 0,
    risk_level: "Critical", suggested_order: 266, lead_time_days: 3,
    rationale: "Base 7-day demand 186.52 kg; adjusted demand ~255.8 kg. Longer horizons are illustrative extrapolations."
  },
  {
    product_id: "PROD-102", product_name: "Rice", current_stock: 263,
    historical_7d: 370, historical_30d: 1580, forecast_7d: 403.51,
    forecast_30d: 1781, forecast_90d: 5343, confidence: 0,
    risk_level: "Low", suggested_order: 236, lead_time_days: 4,
    rationale: "Seeded base 7-day demand 403.51 kg; adjusted demand ~415.62 kg. Longer horizons are illustrative extrapolations."
  },
  {
    product_id: "PROD-103", product_name: "Atta", current_stock: 258,
    historical_7d: 360, historical_30d: 1540, forecast_7d: 393.43,
    forecast_30d: 1737, forecast_90d: 5211, confidence: 0,
    risk_level: "Low", suggested_order: 228, lead_time_days: 4,
    rationale: "Seeded base 7-day demand 393.43 kg; adjusted demand ~405.25 kg. Longer horizons are illustrative extrapolations."
  },
  {
    product_id: "PROD-104", product_name: "Ghee", current_stock: 54,
    historical_7d: 115, historical_30d: 490, forecast_7d: 134.51,
    forecast_30d: 804, forecast_90d: 2413, confidence: 0,
    risk_level: "Critical", suggested_order: 171, lead_time_days: 4,
    rationale: "Seeded base 7-day demand 134.51 kg; adjusted demand ~187.7 kg. Longer horizons are illustrative extrapolations."
  },
  {
    product_id: "PROD-105", product_name: "Sugar", current_stock: 180,
    historical_7d: 230, historical_30d: 990, forecast_7d: 259.56,
    forecast_30d: 1146, forecast_90d: 3437, confidence: 0,
    risk_level: "Low", suggested_order: 141, lead_time_days: 4,
    rationale: "Seeded base 7-day demand 259.56 kg; adjusted demand ~267.35 kg. Longer horizons are illustrative extrapolations."
  },
  {
    product_id: "PROD-106", product_name: "Dry Fruits", current_stock: 18,
    historical_7d: 62, historical_30d: 265, forecast_7d: 74.91,
    forecast_30d: 447, forecast_90d: 1340, confidence: 0,
    risk_level: "Critical", suggested_order: 107, lead_time_days: 4,
    rationale: "Seeded base 7-day demand 74.91 kg; adjusted demand ~104.21 kg. Longer horizons are illustrative extrapolations."
  }
];

export const INITIAL_CATEGORY_PERFORMANCE: CategoryPerformance[] = [
  { category: "Staples", revenue: 1289400, revenue_share: 70.0, margin_pct: 22.0, orders: 994 },
  { category: "Festive", revenue: 552600, revenue_share: 30.0, margin_pct: 25.0, orders: 426 }
];

export const INITIAL_COMPLIANCE: ComplianceData = {
  gstin: "DEMO-NOT-A-REAL-GSTIN",
  gst_status: "Demo profile — verify actual registration",
  filings: [
    { form: "GSTR-1", period: "August 2026", due_date: "11 September 2026", status: "Completed", tax_amount: 0 },
    { form: "GSTR-3B", period: "August 2026", due_date: "01 October 2026", status: "Pending", tax_amount: 0, days_left: 5 },
    { form: "ITR (advance tax)", period: "Demo compliance task", due_date: "04 November 2026", status: "Upcoming", tax_amount: 0, days_left: 39 }
  ],
  eway_reconciliation: { matched_pct: 0, unmatched_bills: 0, itc_claimed: 0, itc_eligible: 0 },
  alerts: ["GSTR-3B is due on 01 October 2026 in the seeded demo scenario. Verify the actual filing details before use."]
};

// Scheme eligibility is not verified/implemented in this snapshot. Do not show fabricated match scores.
export const INITIAL_SCHEMES: GovernmentScheme[] = [];

export const INITIAL_SMART_INSIGHTS: SmartInsight[] = [
  {
    id: "INS-01", category: "Risk", title: "Review Besan procurement before festive demand",
    why: "Adjusted 7-day demand is about 255.8 kg against 21 kg current stock; 20 kg is incoming.",
    supporting_data: "Base demand 186.52 kg; market +14%; festival +24%; priority HIGH.",
    action: "Review procurement for approximately 266 kg additional Besan.", priority: "High"
  },
  {
    id: "INS-02", category: "Inventory", title: "Ghee demand signal needs stock review",
    why: "Seeded adjusted 7-day Ghee demand is about 187.7 kg against 54 kg stock.",
    supporting_data: "Market signal +14%; festival effect +26%; priority HIGH.",
    action: "Review Ghee procurement against supplier lead time.", priority: "High"
  },
  {
    id: "INS-03", category: "Opportunity", title: "Plan for the upcoming festive window",
    why: "The seeded event calendar includes Dhanteras and Diwali in October 2026.",
    supporting_data: "Dhanteras: 11 October 2026; Diwali: 13 October 2026.",
    action: "Review inventory and supplier capacity before the festive period.", priority: "Medium"
  },
  {
    id: "INS-04", category: "Risk", title: "GSTR-3B deadline is approaching in the demo scenario",
    why: "The seeded task is due on 01 October 2026, five days after the demo reference date.",
    supporting_data: "Status: pending; reference date: 26 September 2026.",
    action: "Verify actual filing status and due date against official records.", priority: "Medium"
  }
];

export const INITIAL_DAILY_ACTIONS: DailyAction[] = [
  {
    id: "ACT-101", title: "Review Besan procurement recommendation",
    reason: "Adjusted demand is ~255.8 kg; current stock is 21 kg and 20 kg is incoming.",
    impact: "Supports stock planning; does not trigger an automatic purchase.", priority: "Critical",
    action_type: "PURCHASE_PLAN", target_product: "PROD-101"
  },
  {
    id: "ACT-102", title: "Review Ghee stock planning",
    reason: "Adjusted 7-day demand is 187.7 kg against 54 kg stock.",
    impact: "Helps prepare for the seeded festive demand window.", priority: "High",
    action_type: "PURCHASE_PLAN", target_product: "PROD-104"
  },
  {
    id: "ACT-103", title: "Verify GSTR-3B filing status",
    reason: "Seeded due date is 01 October 2026; countdown uses the demo reference date.",
    impact: "Supports timely filing after confirmation against the actual GST account.", priority: "High",
    action_type: "COMPLIANCE", target_form: "GSTR-3B"
  },
  {
    id: "ACT-104", title: "Review Dhanteras and Diwali stock readiness",
    reason: "The seeded event calendar flags two upcoming October 2026 dates.",
    impact: "Encourages early review of stock and supplier lead times.", priority: "Medium",
    action_type: "INVENTORY_REVIEW"
  }
];

// Offline AI Copilot engine for seamless browser-only performance
export function offlineQueryUdyamAI(query: string): CopilotResponse {
  const q = query.toLowerCase().trim();

  // Keep the three judge-demo flows aligned with the verified backend if the API is offline.
  if (q.includes("mere pending notifications") || q.includes("pending notifications") || q.includes("notifications dikhao")) {
    return {
      query,
      category: "NOTIFICATION",
      direct_answer: "You have 7 notifications. All 7 are unread. There are 2 HIGH, 3 MEDIUM and 2 LOW priority notifications. Key alerts include the festive market signal, Besan procurement review and GSTR-3B due date.",
      metrics_summary: [
        { label: "TOTAL NOTIFICATIONS", value: "7" },
        { label: "UNREAD ALERTS", value: "7" },
        { label: "HIGH PRIORITY", value: "2" },
        { label: "MEDIUM PRIORITY", value: "3" },
        { label: "LOW PRIORITY", value: "2" }
      ],
      structured_table: {
        headers: ["Alert", "Priority", "Status"],
        rows: [
          { alert: "Festive Market Signal (+14%)", priority: "HIGH", status: "Unread" },
          { alert: "Besan Procurement Review (20 kg incoming)", priority: "HIGH", status: "Unread" },
          { alert: "GSTR-3B Tax Due — 01 October 2026", priority: "MEDIUM", status: "Unread" },
          { alert: "Dhanteras Festival Alert", priority: "MEDIUM", status: "Unread" },
          { alert: "Dry Fruits Festive Signal (+9%)", priority: "MEDIUM", status: "Unread" },
          { alert: "Diwali Festival Alert", priority: "LOW", status: "Unread" },
          { alert: "Staples Market Signal (+3%)", priority: "LOW", status: "Unread" }
        ]
      },
      why_recommendation: [
        "Notifications are seeded demo records, not a live vendor account.",
        "Priorities and read states come from the demo notification dataset."
      ],
      actions: [{ label: "Open Notification Center", action: "NAVIGATE", target: "/notifications" }],
      confidence_score: 95
    };
  }

  if (q.includes("gstr") || q.includes("gst 3b") || q.includes("gst") && (q.includes("due") || q.includes("kab") || q.includes("last date"))) {
    return {
      query,
      category: "COMPLIANCE",
      direct_answer: "In the seeded demo scenario, the saved GSTR-3B task has due date 01 October 2026 and status pending. The demo reference date is 26 September 2026, so that scenario showed 5 days remaining. This is not a live GST portal status, and no newer upcoming due-date record is available in the connected demo data.",
      metrics_summary: [
        { label: "FILING FORM", value: "GSTR-3B" },
        { label: "DUE DATE", value: "01 October 2026" },
        { label: "DAYS FROM DEMO DATE", value: "5 days (demo)" },
        { label: "FILING STATUS", value: "Pending" }
      ],
      why_recommendation: [
        "Personalized compliance information comes from the seeded compliance_tasks.csv record.",
        "Demo reference date: 26 September 2026. The 5-day countdown is demo-relative and is not a live GST portal check.",
        "The connected demo data does not contain a newer upcoming GST due-date record; verify actual filing details against official records."
      ],
      actions: [{ label: "Open GST Assistant", action: "NAVIGATE", target: "/compliance?tab=gst" }],
      confidence_score: 95
    };
  }

  if (q.includes("besan") && (q.includes("stock") || q.includes("procurement") || q.includes("incoming po"))) {
    return {
      query,
      category: "BUSINESS",
      direct_answer: "Besan currently has 21 kg in stock, with 20 kg incoming through purchase order po_001. Based on the seeded 7-day demand forecast, review procurement for approximately 266 kg additional Besan.",
      metrics_summary: [
        { label: "CURRENT STOCK", value: "21 kg" },
        { label: "INCOMING PO", value: "20 kg" },
        { label: "ADJUSTED 7-DAY DEMAND", value: "~255.8 kg" },
        { label: "PRIORITY", value: "HIGH" }
      ],
      why_recommendation: [
        "Base demand forecast: 186.52 kg over 7 days.",
        "Market signal: +14%; festival signal: +24%.",
        "The additional-stock figure is a planning recommendation, not an instruction to buy an exact quantity."
      ],
      actions: [{ label: "Review Procurement", action: "NAVIGATE", target: "/procurement-reconciliation?tab=purchase-orders" }],
      confidence_score: 85
    };
  }

  if (q.includes("besan") && (q.includes("next week") || q.includes("forecast") || q.includes("kya scene") || q.includes("demand"))) {
    return {
      query,
      category: "FORECAST",
      direct_answer: "Besan: the base 7-day demand forecast is 187 kg. After market and festival adjustments, expected demand is about 256 kg. Current stock is 21 kg with 20 kg incoming through open purchase orders. The system flags HIGH procurement priority and recommends reviewing approximately 266 kg of additional stock. Market signal: +14%; festival effect: +24%.",
      metrics_summary: [
        { label: "BASE DEMAND", value: "186.52 kg" },
        { label: "ADJUSTED DEMAND", value: "~255.8 kg" },
        { label: "CURRENT STOCK", value: "21 kg" },
        { label: "INCOMING PO", value: "20 kg" },
        { label: "MARKET SIGNAL", value: "+14%" },
        { label: "FESTIVAL EFFECT", value: "+24%" },
        { label: "PRIORITY", value: "HIGH" },
        { label: "RECOMMENDATION", value: "Review procurement for approximately 266 kg additional Besan." }
      ],
      why_recommendation: [
        "Base forecast comes from the saved LightGBM output.",
        "Market and festival adjustments come from the seeded signal dataset.",
        "The recommendation is a review prompt, not an exact purchase order."
      ],
      actions: [{ label: "Review Procurement", action: "NAVIGATE", target: "/procurement-reconciliation?tab=purchase-orders" }],
      confidence_score: 85
    };
  }
  
  if (q.includes("stock") || q.includes("badhana") || q.includes("reorder") || q.includes("agle mahine") || q.includes("kaunse products") || q.includes("stockout")) {
    const stockRows = [
      { product: "Besan", sku: "BESAN", current_stock: 21, forecast_demand_7d: 186.52, suggested_order: 266, priority: "HIGH", reason: "Market +14%; festival effect +24%; review procurement." },
      { product: "Rice", sku: "RICE", current_stock: 263, forecast_demand_7d: 403.51, suggested_order: 236, priority: "MEDIUM", reason: "Review stock against seeded 7-day demand." },
      { product: "Atta", sku: "ATTA", current_stock: 258, forecast_demand_7d: 393.43, suggested_order: 228, priority: "MEDIUM", reason: "Review stock against seeded 7-day demand." },
      { product: "Ghee", sku: "GHEE", current_stock: 54, forecast_demand_7d: 134.51, suggested_order: 171, priority: "HIGH", reason: "Market +14%; festival effect +26%; review procurement." },
      { product: "Sugar", sku: "SUGAR", current_stock: 180, forecast_demand_7d: 259.56, suggested_order: 141, priority: "MEDIUM", reason: "Review stock against seeded 7-day demand." },
      { product: "Dry Fruits", sku: "DRYFR", current_stock: 18, forecast_demand_7d: 74.91, suggested_order: 107, priority: "HIGH", reason: "Market +9%; festival effect +31%; review procurement." }
    ];
    return {
      query,
      category: "INVENTORY_REORDER",
      direct_answer: "For Sharma General Store, the seeded forecast flags Besan, Ghee and Dry Fruits as HIGH-priority stock reviews. The suggested quantities are planning prompts—not purchase orders—and should be checked against current supplier lead times and actual records.",
      metrics_summary: [
        { label: "SEEDED PRODUCTS", value: "6 grocery items" },
        { label: "HIGH PRIORITY", value: "3 products" },
        { label: "TOTAL SUGGESTED STOCK", value: "1,149 kg (review only)" },
        { label: "DATA MODE", value: "Seeded demo scenario" }
      ],
      structured_table: {
        headers: ["Product", "Current Stock", "Base 7-Day Demand", "Suggested Additional Stock", "Priority / Reason"],
        rows: stockRows.map((row) => ({
          product: row.product,
          sku: row.sku,
          current_stock: `${row.current_stock} kg`,
          forecast_demand: `${row.forecast_demand_7d} kg`,
          suggested_order: `Review ~${row.suggested_order} kg`,
          reason: `${row.priority}: ${row.reason}`
        }))
      },
      why_recommendation: [
        "Product names and current stock values come from the seeded grocery demo data.",
        "Seven-day base forecasts and suggested quantities come from the saved recommendation artifact.",
        "No purchase order is automatically submitted by this offline fallback."
      ],
      actions: [
        { label: "View Forecast Details", action: "NAVIGATE", target: "/forecast" },
        { label: "Review Inventory", action: "NAVIGATE", target: "/inventory" }
      ],
      confidence_score: 85
    };
  }

  if (q.includes("sales kyu") || q.includes("sales dropping") || q.includes("declining") || q.includes("gir rahe")) {
    return {
      query,
      category: "SALES_DIAGNOSTIC",
      direct_answer: "I cannot verify a cause for declining sales from this repository's seeded core data. The broader sales charts use illustrative aggregates; connect or upload actual sales transactions before attributing a decline to a product or category.",
      metrics_summary: [
        { label: "VERIFIED SALES LEDGER", value: "Not included in core demo snapshot" },
        { label: "BUSINESS CONTEXT", value: "Sharma General Store · Grocery/Retail" },
        { label: "DIAGNOSTIC STATUS", value: "Needs actual transaction records" }
      ],
      structured_table: { headers: ["Evidence needed", "Purpose"], rows: [
        { evidence: "Dated sales by product", purpose: "Measure real growth/decline" },
        { evidence: "Prices, discounts and returns", purpose: "Separate volume changes from pricing effects" },
        { evidence: "Category totals over comparable periods", purpose: "Validate whether a category is driving the change" }
      ] },
      why_recommendation: ["Do not infer a sales cause from illustrative dashboard values."],
      actions: [{ label: "Open Sales Dashboard", action: "NAVIGATE", target: "/sales" }],
      confidence_score: 60
    };
  }

  if (q.includes("profit") || q.includes("zyada profit") || q.includes("highest margin") || q.includes("margin") || q.includes("munafa")) {
    return {
      query,
      category: "PROFITABILITY_ANALYSIS",
      direct_answer: "The current snapshot does not include a verified product-level sales and cost ledger, so I cannot reliably rank the most profitable item. Unit prices and margin fields in the broader offline dashboard are explicitly illustrative.",
      metrics_summary: [
        { label: "VERIFIED PRODUCT MARGINS", value: "Not available in this snapshot" },
        { label: "UNIT PRICES", value: "Illustrative demo values" },
        { label: "NEXT STEP", value: "Connect actual sales and cost records" }
      ],
      structured_table: { headers: ["Data needed", "Why it matters"], rows: [
        { evidence: "Net selling price", purpose: "Account for discounts, tax and returns" },
        { evidence: "Purchase cost and landed expenses", purpose: "Estimate true product cost" },
        { evidence: "Sold quantity by period", purpose: "Compare margin with contribution" }
      ] },
      why_recommendation: ["Avoid treating illustrative prices or margins as financial advice or verified ledger results."],
      actions: [{ label: "Open Sales Analysis", action: "NAVIGATE", target: "/sales" }],
      confidence_score: 60
    };
  }

  if (q.includes("gst") || q.includes("filing") || q.includes("gstr") || q.includes("tax") || q.includes("due date") || q.includes("kab hai")) {
    return {
      query,
      category: "COMPLIANCE_ASSISTANT",
      direct_answer: "In the seeded demo scenario, GSTR-3B is due on 01 October 2026 and is marked pending. The saved demo reference date is 26 September 2026, so the scenario shows 5 days remaining. Verify actual filing details before use.",
      metrics_summary: [
        { label: "FILING FORM", value: "GSTR-3B" },
        { label: "DUE DATE", value: "01 October 2026" },
        { label: "DAYS REMAINING", value: "5 days (demo reference date)" },
        { label: "STATUS", value: "Pending in seeded demo" }
      ],
      structured_table: { headers: ["Field", "Value"], rows: [
        { field: "Reference date", value: "26 September 2026" },
        { field: "Live GST filing verification", value: "Not connected" }
      ] },
      why_recommendation: ["Personalized countdown comes from the seeded compliance task and fixed demo reference date, not from an official live filing lookup."],
      actions: [{ label: "Review Compliance", action: "NAVIGATE", target: "/compliance?tab=gst" }],
      confidence_score: 90
    };
  }

  return {
    query,
    category: "GENERAL_BUSINESS_ADVICE",
    direct_answer: "I can answer questions grounded in this Sharma General Store demo's six grocery products, saved 7-day forecast, seeded market/festival signals, seven notifications, and GSTR-3B demo task. Sales aggregates, profitability, bank reconciliation, scheme eligibility and PS26091 financial structuring are not verified end-to-end in this repository snapshot.",
    metrics_summary: [
      { label: "BUSINESS", value: "Sharma General Store · Delhi" },
      { label: "SEEDED PRODUCTS", value: "6 grocery items" },
      { label: "NOTIFICATIONS", value: "7 seeded records" },
      { label: "DATA MODE", value: "Demo / seeded" }
    ],
    structured_table: { headers: ["Supported flow", "Example question"], rows: [
      { pillar: "Demand forecast", status: "Seeded 7-day forecast", recommendation: "Besan ka next week kya scene hai?" },
      { pillar: "Inventory", status: "Seeded stock + purchase order", recommendation: "Besan ka stock aur procurement kya scene hai?" },
      { pillar: "Notifications", status: "Seeded notification feed", recommendation: "Mere pending notifications dikhao" },
      { pillar: "Compliance", status: "Seeded GSTR-3B due task", recommendation: "Mera GST 3B kab due hai?" }
    ] },
    why_recommendation: [
      "The LLM should not invent numeric business facts.",
      "Core demo results are served from deterministic data and engine outputs.",
      "Unavailable data is called out instead of being presented as verified."
    ],
    actions: [{ label: "Open AI Copilot", action: "NAVIGATE", target: "/copilot" }],
    confidence_score: 85
  };
}
