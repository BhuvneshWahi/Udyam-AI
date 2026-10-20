export interface BusinessProfile {
  name: string;
  owner: string;
  business_type: string;
  gstin: string;
  state: string;
  city: string;
  business_age_years: number;
  employee_count: number;
  annual_revenue: number;
  sector: string;
  preferred_language: string;
  ai_personalization: string;
}

export interface KPIs {
  today_sales: number;
  today_sales_change: number;
  monthly_revenue: number;
  monthly_revenue_change: number;
  gross_profit: number;
  profit_margin: number;
  monthly_orders: number;
  orders_change: number;
  inventory_value: number;
  total_skus: number;
  low_stock_items: number;
  critical_stock_items: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  cost_price: number;
  selling_price: number;
  avg_daily_sales: number;
  days_remaining: number;
  status: 'Critical' | 'Low' | 'Healthy' | 'Overstocked';
  forecast_demand_30d: number;
  suggested_reorder: number;
  sales_growth_30d: number;
  margin_pct: number;
}

export interface SalesTrend {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface DemandForecast {
  product_id: string;
  product_name: string;
  current_stock: number;
  historical_7d: number;
  historical_30d: number;
  forecast_7d: number;
  forecast_30d: number;
  forecast_90d: number;
  confidence: number;
  risk_level: 'Critical' | 'Low' | 'Medium' | 'Healthy' | 'Overstocked';
  suggested_order: number;
  lead_time_days: number;
  rationale: string;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  revenue_share: number;
  margin_pct: number;
  orders: number;
}

export interface ComplianceFiling {
  form: string;
  period: string;
  due_date: string;
  status: 'Completed' | 'Pending' | 'Upcoming';
  tax_amount: number;
  days_left?: number;
}

export interface ComplianceData {
  gstin: string;
  gst_status: string;
  filings: ComplianceFiling[];
  eway_reconciliation: {
    matched_pct: number;
    unmatched_bills: number;
    itc_claimed: number;
    itc_eligible: number;
  };
  alerts: string[];
}

export interface GovernmentScheme {
  id: string;
  name: string;
  provider: string;
  max_benefit: string;
  eligibility_match: number;
  status: string;
  sector: string;
  description: string;
  why_recommended: string;
}

export interface SmartInsight {
  id: string;
  category: 'Opportunity' | 'Risk' | 'Profitability' | 'Inventory' | 'Growth';
  title: string;
  why: string;
  supporting_data: string;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface DailyAction {
  id: string;
  title: string;
  reason: string;
  impact: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  action_type: string;
  target_product?: string;
  target_form?: string;
  target_scheme?: string;
}

export interface ActionButton {
  label: string;
  action: string;
  target: string;
}

export interface MetricSummary {
  label: string;
  value: string;
}

export interface CopilotResponse {
  query: string;
  category: string;
  direct_answer: string;
  metrics_summary: MetricSummary[];
  structured_table?: {
    headers: string[];
    rows: any[];
  };
  why_recommendation: string[];
  actions: ActionButton[];
  confidence_score: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  response?: CopilotResponse;
}

// ─── Phase 2 Types ─────────────────────────────────────────────────────────

export interface FinancialMetrics {
  monthly_revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  operating_expenses: number;
  net_profit: number;
  net_margin_pct: number;
  inventory_value: number;
  receivables: number;
  payables: number;
  working_capital: number;
  working_capital_ratio?: number;
  liquidity_runway_days?: number;
  ebitda?: number;
  cash_conversion_cycle_days: number;
  dio_days: number;
  dso_days: number;
  dpo_days: number;
  evidence_formula: string[];
}

export interface MarketSignal {
  signal_id: string;
  category: string;
  trend_keyword: string;
  source: string;
  trend_growth_30d_pct: number;
  signal_strength: 'STRONG_RISING' | 'MODERATE_RISING' | 'STABLE' | 'SLOW_MOVING' | 'DECLINING';
  matched_products: string[];
  market_vs_business_gap: string;
  recommendation: string;
}

export interface FestivalIntelligence {
  id: string;
  name: string;
  date: string;
  days_remaining: number;
  region: string;
  business_categories: string[];
  historical_demand_lift_pct: number;
  lead_time_required_days: number;
  trigger_schedule: number[];
  recommendation: string;
}

export interface ReconciliationMatch {
  id: string;
  type: string;
  source_doc: string;
  target_doc: string;
  counterparty: string;
  expected_amount: number;
  actual_amount: number;
  discrepancy: number;
  status: 'MATCHED' | 'REVIEW_REQUIRED' | 'MISMATCH' | 'MISSING';
  confidence: number;
  evidence: string;
}

export interface ReconciliationResult {
  matches: ReconciliationMatch[];
  summary: {
    total_records_processed: number;
    matched_records: number;
    review_required_records: number;
    total_discrepancy_amount: number;
    overall_reconciliation_health_pct: number;
  };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  gst_rate: number;
  subtotal: number;
  gst_amount: number;
  total: number;
}

export interface Invoice {
  invoice_number: string;
  date: string;
  due_date: string;
  customer_name: string;
  customer_gstin?: string;
  customer_address?: string;
  items: InvoiceItem[];
  payment_terms: string;
  notes?: string;
  subtotal: number;
  total_discount: number;
  total_gst: number;
  grand_total: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE';
}

export interface ProfitLeak {
  id: string;
  type: 'MARGIN_COMPRESSION' | 'RISING_COSTS' | 'EXCESSIVE_DISCOUNT' | 'LOW_MARGIN_SKU' | 'SLOW_MOVING_CASH_LOCK';
  title: string;
  problem: string;
  evidence: string;
  estimated_impact_monthly: number;
  priority: 'High' | 'Medium' | 'Low';
  recommended_action: string;
}

export interface CashFlowAlert {
  id: string;
  type: 'RECEIVABLE_PRESSURE' | 'INVENTORY_CASH_LOCK' | 'EXPENSE_SPIKE' | 'PAYMENT_DUE' | 'CASH_POSITIVE';
  title: string;
  description: string;
  amount?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  due_date?: string;
  recommended_action: string;
}

export interface SmartReminder {
  id: string;
  category: 'GST' | 'ITR' | 'Insurance' | 'DSC' | 'PAN' | 'UDYAM' | 'PO' | 'Invoice' | 'Payment' | 'Other';
  title: string;
  due_date: string;
  days_left: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  action: string;
  status: 'OVERDUE' | 'TODAY' | 'UPCOMING';
}

export interface BusinessSignal {
  id: string;
  source: string;
  type: 'RISK' | 'OPPORTUNITY' | 'ALERT' | 'INFO';
  title: string;
  evidence: string;
  impact: string;
  priority: 'High' | 'Medium' | 'Low';
  signal?: string;
  severity?: string;
  affected_area?: string;
  explanation?: string;
  recommended_action?: string;
  affected_items?: string[];
}

export interface HealthDimension {
  label: string;
  score: number;
  status: 'Healthy' | 'Attention' | 'Critical';
  reason: string;
}

export interface BusinessHealthScore {
  overall_score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  status: 'Healthy' | 'Attention' | 'Critical';
  dimensions: HealthDimension[];
  evidence: string[];
  last_calculated: string;
}

export interface AgreementAnalysis {
  agreement_id?: string;
  clauses_analyzed?: number;
  risks_identified?: number;
  summary: string;
  key_terms?: string[];
  payment_terms: string;
  termination_clause: string;
  termination_notice?: string;
  penalty_clause?: string;
  liability_clause?: string;
  risk_flags?: string[];
  recommendations?: string[];
  compatibility_score: number;
}

export interface Reminder {
  id: string;
  title: string;
  category: string;
  due_date: string;
  days_remaining: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';
  action: string;
}

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export type NotificationType = 
  | 'gst_deadline'
  | 'gstr1_deadline'
  | 'gstr3b_deadline'
  | 'tds_deadline'
  | 'epf_esi_deadline'
  | 'advance_tax_deadline'
  | 'overdue_payment'
  | 'low_inventory'
  | 'high_demand_signal'
  | 'festival_demand'
  | 'pending_pr'
  | 'pending_po'
  | 'profit_leak'
  | 'cash_flow_risk'
  | 'ai_insight'
  | 'compliance_alert'
  | 'system';

export type NotificationCategory = 
  | 'Compliance' 
  | 'Payments' 
  | 'Inventory' 
  | 'Market' 
  | 'Finance' 
  | 'Procurement' 
  | 'Documents' 
  | 'Actions'
  | 'AI'
  | 'System';

export interface BusinessNotification {
  id: string;
  title: string;
  message: string;
  description?: string;
  type: NotificationType;
  category: NotificationCategory;
  severity: NotificationSeverity;
  stage?: 'T-30' | 'T-21' | 'T-7' | 'T-1' | 'T+0' | 'T+1';
  dueDate?: string;
  actionLabel?: string;
  actionUrl?: string;
  timestamp: string;
  createdAt: number;
  isRead: boolean;
  isDismissed?: boolean;
}

export interface NotificationPreferences {
  compliance: boolean;
  finance: boolean;
  inventory: boolean;
  market: boolean;
  procurement: boolean;
  ai_insights: boolean;
  desktop_notifications: boolean;
}

// ─── AIML LightGBM Demand Forecasting & Procurement Interfaces ──────────

export interface AIMLForecastRecord {
  date: string;
  product_id: string;
  product_name: string;
  predicted_demand: number;
  market_signal: number;
  event_adjustment: number;
  adjusted_demand: number;
}

export interface AIMLRecommendation {
  product_id: string;
  product_name: string;
  base_7_day_demand_kg: number;
  market_signal_pct: number;
  festival_signal_pct: number;
  adjusted_7_day_demand_kg: number;
  current_inventory_kg: number;
  incoming_po_kg: number;
  recommended_additional_stock_kg: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  planning_statement: string;
}

export interface AIMLProductInsight {
  product_id: string;
  product_name: string;
  forecast: AIMLForecastRecord[];
  recommendation: AIMLRecommendation;
  planning_statement?: string;
}

export interface AIMLSummary {
  status: string;
  engine: string;
  horizon: string;
  products_count: number;
  high_priority_count: number;
  medium_priority_count: number;
  total_recommended_procurement_kg: number;
  total_adjusted_7_day_demand_kg: number;
  features_count: number;
  model_artifact_present: boolean;
  recommendations: AIMLRecommendation[];
}



