/**
 * Offline fallback data for UDYAM AI.
 *
 * The market and festival entries mirror the seeded Sharma General Store demo
 * signals. Financial aggregates are illustrative. No bank/invoice/GST-ledger
 * reconciliation records are included in the verified demo snapshot, so the
 * reconciliation fallback intentionally reports no matches rather than
 * inventing counterparties, GSTINs, or discrepancies.
 */

import type {
  FinancialMetrics,
  MarketSignal,
  FestivalIntelligence,
  ReconciliationResult,
} from '../types';

export const FALLBACK_FINANCIAL_METRICS: FinancialMetrics = {
  // Illustrative dashboard fixtures only; not a verified financial ledger.
  monthly_revenue: 1842000,
  cogs: 1252560,
  gross_profit: 589440,
  gross_margin_pct: 32.0,
  operating_expenses: 257880,
  net_profit: 331560,
  net_margin_pct: 18.0,
  inventory_value: 62295,
  receivables: 345000,
  payables: 210000,
  working_capital: 1620200,
  cash_conversion_cycle_days: 38.4,
  dio_days: 35.6,
  dso_days: 5.6,
  dpo_days: 2.8,
  evidence_formula: [
    'Illustrative demo values only; no verified financial ledger is included in this fallback.',
    'Do not use these values for accounting, tax, lending, or procurement decisions.',
  ],
};

export const FALLBACK_MARKET_SIGNALS: MarketSignal[] = [
  {
    signal_id: 'sig_001',
    category: 'Festive Grocery / Retail',
    trend_keyword: 'Besan and ghee festive demand',
    source: 'Seeded backend/verified_data/market_signals.csv',
    trend_growth_30d_pct: 14.0,
    signal_strength: 'STRONG_RISING',
    matched_products: ['PROD-101', 'PROD-104'],
    market_vs_business_gap:
      'Seeded festive grocery signal is +14%; review product-level demand and available stock before acting.',
    recommendation:
      'Review Besan and Ghee stock against the seeded 7-day demand forecast and actual supplier lead times.',
  },
  {
    signal_id: 'sig_002',
    category: 'Staples / Grocery Retail',
    trend_keyword: 'Staples market signal',
    source: 'Seeded backend/verified_data/market_signals.csv',
    trend_growth_30d_pct: 3.0,
    signal_strength: 'STABLE',
    matched_products: ['PROD-102', 'PROD-103', 'PROD-105'],
    market_vs_business_gap:
      'Seeded staples movement is modest at +3%; treat as a planning signal, not a live market quote.',
    recommendation:
      'Review staples demand and supplier prices using current business records before changing procurement.',
  },
  {
    signal_id: 'sig_003',
    category: 'Festive Grocery / Retail',
    trend_keyword: 'Dry fruits festive signal',
    source: 'Seeded backend/verified_data/market_signals.csv',
    trend_growth_30d_pct: 9.0,
    signal_strength: 'MODERATE_RISING',
    matched_products: ['PROD-106'],
    market_vs_business_gap:
      'Seeded national festive grocery signal is +9%; it is not a real-time price or import-cost feed.',
    recommendation:
      'Review Dry Fruits stock and sourcing assumptions before the festive period.',
  },
];

export const FALLBACK_FESTIVALS: FestivalIntelligence[] = [
  {
    id: 'evt_dhanteras_2026',
    name: 'Dhanteras',
    date: '2026-10-11',
    days_remaining: 15,
    region: 'Demo calendar / India',
    business_categories: ['Grocery / Retail', 'Festive'],
    historical_demand_lift_pct: 10.0,
    lead_time_required_days: 7,
    trigger_schedule: [14, 7, 3],
    recommendation:
      'Seeded event signal only: review relevant stock and supplier lead times before Dhanteras; no automatic order is created.',
  },
  {
    id: 'evt_diwali_2026',
    name: 'Diwali',
    date: '2026-10-13',
    days_remaining: 17,
    region: 'Demo calendar / India',
    business_categories: ['Grocery / Retail', 'Festive'],
    historical_demand_lift_pct: 5.0,
    lead_time_required_days: 7,
    trigger_schedule: [14, 7, 3],
    recommendation:
      'Seeded event signal only: review festive demand assumptions against actual sales and supplier capacity.',
  },
];

export const FALLBACK_RECONCILIATION: ReconciliationResult = {
  matches: [],
  summary: {
    total_records_processed: 0,
    matched_records: 0,
    review_required_records: 0,
    total_discrepancy_amount: 0,
    overall_reconciliation_health_pct: 0,
  },
};
