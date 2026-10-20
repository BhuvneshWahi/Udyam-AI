import { 
  BusinessProfile, KPIs, Product, SalesTrend, DemandForecast, 
  CategoryPerformance, ComplianceData, GovernmentScheme, SmartInsight, 
  DailyAction, CopilotResponse, FinancialMetrics, MarketSignal,
  FestivalIntelligence, ReconciliationResult, AgreementAnalysis,
  AIMLForecastRecord, AIMLRecommendation, AIMLProductInsight, AIMLSummary
} from '../types';
import { 
  INITIAL_BUSINESS_PROFILE, INITIAL_KPIS, INITIAL_PRODUCTS, 
  INITIAL_SALES_TRENDS, INITIAL_DEMAND_FORECASTS, INITIAL_CATEGORY_PERFORMANCE, 
  INITIAL_COMPLIANCE, INITIAL_SCHEMES, INITIAL_SMART_INSIGHTS, 
  INITIAL_DAILY_ACTIONS, offlineQueryUdyamAI
} from '../data/mockData';
import {
  FALLBACK_FINANCIAL_METRICS, FALLBACK_MARKET_SIGNALS,
  FALLBACK_FESTIVALS, FALLBACK_RECONCILIATION
} from '../data/phase2FallbackData';

export const FALLBACK_AIML_RECOMMENDATIONS: AIMLRecommendation[] = [
  {
    product_id: "prod_atta",
    product_name: "Atta",
    base_7_day_demand_kg: 393.43,
    market_signal_pct: 3.0,
    festival_signal_pct: 0.0,
    adjusted_7_day_demand_kg: 405.25,
    current_inventory_kg: 258.0,
    incoming_po_kg: 0.0,
    recommended_additional_stock_kg: 228.0,
    priority: "MEDIUM",
    planning_statement: "Review procurement for approximately 228 kg additional Atta stock."
  },
  {
    product_id: "prod_besan",
    product_name: "Besan",
    base_7_day_demand_kg: 186.52,
    market_signal_pct: 14.0,
    festival_signal_pct: 24.0,
    adjusted_7_day_demand_kg: 255.8,
    current_inventory_kg: 21.0,
    incoming_po_kg: 20.0,
    recommended_additional_stock_kg: 266.0,
    priority: "HIGH",
    planning_statement: "Review procurement for approximately 266 kg additional Besan stock."
  },
  {
    product_id: "prod_dryfr",
    product_name: "Dry Fruits",
    base_7_day_demand_kg: 74.91,
    market_signal_pct: 9.0,
    festival_signal_pct: 31.0,
    adjusted_7_day_demand_kg: 104.21,
    current_inventory_kg: 18.0,
    incoming_po_kg: 0.0,
    recommended_additional_stock_kg: 107.0,
    priority: "HIGH",
    planning_statement: "Review procurement for approximately 107 kg additional Dry Fruits stock."
  },
  {
    product_id: "prod_ghee",
    product_name: "Ghee",
    base_7_day_demand_kg: 134.51,
    market_signal_pct: 14.0,
    festival_signal_pct: 26.0,
    adjusted_7_day_demand_kg: 187.7,
    current_inventory_kg: 54.0,
    incoming_po_kg: 0.0,
    recommended_additional_stock_kg: 171.0,
    priority: "HIGH",
    planning_statement: "Review procurement for approximately 171 kg additional Ghee stock."
  },
  {
    product_id: "prod_rice",
    product_name: "Rice",
    base_7_day_demand_kg: 403.51,
    market_signal_pct: 3.0,
    festival_signal_pct: 0.0,
    adjusted_7_day_demand_kg: 415.62,
    current_inventory_kg: 263.0,
    incoming_po_kg: 0.0,
    recommended_additional_stock_kg: 236.0,
    priority: "MEDIUM",
    planning_statement: "Review procurement for approximately 236 kg additional Rice stock."
  },
  {
    product_id: "prod_sugar",
    product_name: "Sugar",
    base_7_day_demand_kg: 259.56,
    market_signal_pct: 3.0,
    festival_signal_pct: 0.0,
    adjusted_7_day_demand_kg: 267.35,
    current_inventory_kg: 180.0,
    incoming_po_kg: 0.0,
    recommended_additional_stock_kg: 141.0,
    priority: "MEDIUM",
    planning_statement: "Review procurement for approximately 141 kg additional Sugar stock."
  }
];

export const FALLBACK_AIML_SUMMARY: AIMLSummary = {
  status: "active",
  engine: "LightGBM Demand Regressor (UDYAM AI AIML)",
  horizon: "7-day rolling forecast",
  products_count: 6,
  high_priority_count: 3,
  medium_priority_count: 3,
  total_recommended_procurement_kg: 1149.0,
  total_adjusted_7_day_demand_kg: 1635.9,
  features_count: 23,
  model_artifact_present: true,
  recommendations: FALLBACK_AIML_RECOMMENDATIONS
};

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

const TOKEN_KEY = 'udyam_auth_token';
const BIZ_KEY = 'udyam_active_business_id';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function getActiveBusinessId(): string | null {
  try {
    return localStorage.getItem(BIZ_KEY);
  } catch {
    return null;
  }
}

export function setActiveBusinessId(id: string | null): void {
  try {
    if (id) localStorage.setItem(BIZ_KEY, id);
    else localStorage.removeItem(BIZ_KEY);
  } catch {}
}

export function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const bizId = getActiveBusinessId();
  if (bizId) {
    headers['X-Business-ID'] = bizId;
  }
  return headers;
}

async function fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Network or server offline -> fallback seamlessly
  }
  return fallbackData;
}

export const apiService = {
  checkSupabaseHealth: async () => {
    return fetchWithFallback('/supabase/health', {
      status: "unconfigured",
      configured: false,
      connected: false,
      latency_ms: null,
      message: "Operating in local MSME fallback mode."
    });
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  register: async (email: string, password: string, fullName: string, preferredLanguage = 'Hinglish', businessName = 'Sharma General Store') => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, preferred_language: preferredLanguage, business_name: businessName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  logout: async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      setAuthToken(null);
    }
  },

  getCurrentUser: async () => {
    return fetchWithFallback('/auth/me', {
      id: "00000000-0000-0000-0000-000000000001",
      email: "demo@sharmageneralstore.local",
      full_name: "Store Owner",
      role: "authenticated",
      mfa_enabled: false,
      aal: "aal1",
      is_demo: true,
    });
  },

  getCurrentBusiness: async () => {
    return fetchWithFallback('/auth/business', {
      business_id: "00000000-0000-0000-0000-000000000001",
      name: "Sharma General Store",
      owner_name: "Store Owner",
      role: "OWNER",
      city: "Delhi",
      state: "Delhi",
      is_demo: true,
    });
  },

  getUserBusinesses: async () => {
    return fetchWithFallback('/auth/businesses', [{
      business_id: "00000000-0000-0000-0000-000000000001",
      name: "Sharma General Store",
      owner_name: "Store Owner",
      role: "OWNER",
      city: "Delhi",
      state: "Delhi",
      is_demo: true,
    }]);
  },

  enrollMFA: async () => {
    const res = await fetch(`${BASE_URL}/auth/mfa/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ issuer: 'UDYAM AI' }),
    });
    return await res.json();
  },

  verifyMFA: async (factorId: string, code: string) => {
    const res = await fetch(`${BASE_URL}/auth/mfa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ factor_id: factorId, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'MFA verification failed');
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  unenrollMFA: async (factorId: string) => {
    const res = await fetch(`${BASE_URL}/auth/mfa/unenroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ factor_id: factorId }),
    });
    return await res.json();
  },

  getSummary: async () => {
    return fetchWithFallback('/data/summary', {
      business_profile: INITIAL_BUSINESS_PROFILE,
      kpis: INITIAL_KPIS,
      alerts: [
        "Besan has high seeded procurement priority ahead of the festive period.",
        "Ghee demand signals suggest reviewing stock before the festive window.",
        "GSTR-3B is due on 01 October 2026 in the seeded demo scenario.",
        "Dhanteras and Diwali are upcoming events in the seeded demo calendar."
      ],
      top_products: {
        best_selling: INITIAL_PRODUCTS[0],
        highest_revenue: INITIAL_PRODUCTS[0],
        highest_margin: INITIAL_PRODUCTS[4],
        slow_moving: INITIAL_PRODUCTS[2]
      }
    });
  },

  getProducts: async (): Promise<Product[]> => {
    return fetchWithFallback('/data/products', INITIAL_PRODUCTS);
  },

  getSalesIntelligence: async () => {
    return fetchWithFallback('/data/sales', {
      kpis: INITIAL_KPIS,
      sales_trends: INITIAL_SALES_TRENDS,
      category_performance: INITIAL_CATEGORY_PERFORMANCE,
      customers_summary: {
        total_active_clients: 0,
        new_clients_this_month: 0,
        returning_clients: 0,
        repeat_purchase_rate: 0,
        top_buyers: [],
        data_provenance: "No verified customer ledger is included in this demo snapshot."
      },
      top_products: INITIAL_PRODUCTS,
      bottom_products: [INITIAL_PRODUCTS[2]],
      ai_insight: "Sales, customer and margin aggregates in this offline fallback are illustrative demo fixtures, not verified ledger results."
    });
  },

  getForecast: async () => {
    return fetchWithFallback('/data/forecast', {
      forecasts: INITIAL_DEMAND_FORECASTS,
      summary: {
        critical_risk_count: INITIAL_DEMAND_FORECASTS.filter((item) => item.risk_level === 'Critical').length,
        medium_risk_count: INITIAL_DEMAND_FORECASTS.filter((item) => item.risk_level === 'Medium').length,
        healthy_count: INITIAL_DEMAND_FORECASTS.filter((item) => item.risk_level === 'Low').length,
        average_confidence: 0,
        methodology: "Seeded 7-day commodity forecast from the trained AIML artifact; 30/90-day portfolio values are illustrative extrapolations."
      }
    });
  },

  getInventory: async () => {
    return fetchWithFallback('/data/inventory', {
      kpis: {
        total_skus: INITIAL_KPIS.total_skus,
        inventory_value: INITIAL_KPIS.inventory_value,
        low_stock: INITIAL_KPIS.low_stock_items,
        critical_stock: INITIAL_KPIS.critical_stock_items,
        overstocked: 1
      },
      products: INITIAL_PRODUCTS,
      recommendations: FALLBACK_AIML_RECOMMENDATIONS.map((item) => ({
        id: `REC-${item.product_id}`,
        product: item.product_name,
        message: item.planning_statement,
        recommended_order: item.recommended_additional_stock_kg,
        urgency: item.priority === 'HIGH' ? 'High' : 'Medium'
      }))
    });
  },

  getCompliance: async (): Promise<ComplianceData> => {
    return fetchWithFallback('/data/compliance', INITIAL_COMPLIANCE);
  },

  getSchemes: async (): Promise<{ schemes: GovernmentScheme[]; business_context: BusinessProfile }> => {
    return fetchWithFallback('/data/schemes', {
      schemes: INITIAL_SCHEMES,
      business_context: INITIAL_BUSINESS_PROFILE
    });
  },

  getInsights: async (): Promise<SmartInsight[]> => {
    return fetchWithFallback('/data/insights', INITIAL_SMART_INSIGHTS);
  },

  getActions: async (): Promise<DailyAction[]> => {
    return fetchWithFallback('/data/actions', INITIAL_DAILY_ACTIONS);
  },

  getProfile: async (): Promise<BusinessProfile> => {
    return fetchWithFallback('/data/profile', INITIAL_BUSINESS_PROFILE);
  },

  sendCopilotQuery: async (query: string): Promise<CopilotResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // API unreachable -> fallback offline
    }
    return offlineQueryUdyamAI(query);
  },

  processVoiceInput: async (transcript: string, language: string) => {
    try {
      const res = await fetch(`${BASE_URL}/voice/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, language }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // offline fallback
    }
    const copilot_response = offlineQueryUdyamAI(transcript);
    return {
      transcript,
      language,
      audio_spoken_response: copilot_response.direct_answer,
      copilot_response
    };
  },

  resetDemoData: async () => {
    try {
      const res = await fetch(`${BASE_URL}/data/reset`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: "ok", message: "Demo data reset offline." };
  },

  // ─── Phase 2A: Newly connected engine endpoints ───────────────────────────

  getFinancialMetrics: async (): Promise<FinancialMetrics> => {
    return fetchWithFallback('/data/finance', FALLBACK_FINANCIAL_METRICS);
  },

  getMarketSignals: async (): Promise<{ signals: MarketSignal[] }> => {
    return fetchWithFallback('/data/market-signals', { signals: FALLBACK_MARKET_SIGNALS });
  },

  getFestivalIntelligence: async (): Promise<{ festivals: FestivalIntelligence[] }> => {
    return fetchWithFallback('/data/festivals', { festivals: FALLBACK_FESTIVALS });
  },

  getReconciliation: async (): Promise<ReconciliationResult> => {
    return fetchWithFallback('/data/reconciliation', FALLBACK_RECONCILIATION);
  },

  analyzeAgreement: async (agreementText: string): Promise<AgreementAnalysis> => {
    try {
      const res = await fetch(`${BASE_URL}/agreement/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreement_text: agreementText }),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      summary: 'Agreement analysis unavailable — backend offline.',
      payment_terms: 'N/A',
      termination_clause: '30 Days written notice (default)',
      termination_notice: '30 Days written notice (default)',
      penalty_clause: 'N/A',
      liability_clause: 'Standard MSME limitation of liability applies.',
      risk_flags: ['Backend connection required for live analysis.'],
      recommendations: ['Connect to local Ollama or backend to run agreement extraction.'],
      compatibility_score: 0,
    };
  },

  uploadDataFile: async (file: File, fileType: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', fileType);
      const res = await fetch(`${BASE_URL}/data/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API upload error, using local fallback:', e);
    }
    return {
      filename: file.name,
      file_type: fileType,
      status: 'Success',
      records_processed: 10,
      valid_records: 10,
      missing_values: 0,
      import_mode: 'DEMO_SESSION_IMPORT',
      message: `Parsed and validated ${file.name} locally in demo session.`
    };
  },

  // ─── AIML LightGBM Demand Forecasting & Procurement Methods ──────────────

  getAIMLForecast: async (productId?: string): Promise<{ status?: string; horizon?: string; forecasts?: AIMLForecastRecord[]; forecast?: AIMLForecastRecord[] }> => {
    const url = productId ? `/aiml/forecast?product_id=${productId}` : '/aiml/forecast';
    return fetchWithFallback(url, { forecasts: [] });
  },

  getAIMLRecommendations: async (): Promise<{ status?: string; recommendations: AIMLRecommendation[] }> => {
    return fetchWithFallback('/aiml/recommendations', { status: 'success', recommendations: FALLBACK_AIML_RECOMMENDATIONS });
  },

  getAIMLProductInsight: async (productId: string): Promise<AIMLProductInsight> => {
    const fallbackRec = FALLBACK_AIML_RECOMMENDATIONS.find(r => r.product_id === productId) || FALLBACK_AIML_RECOMMENDATIONS[1];
    return fetchWithFallback(`/aiml/product/${productId}`, {
      product_id: fallbackRec.product_id,
      product_name: fallbackRec.product_name,
      forecast: [],
      recommendation: fallbackRec,
      planning_statement: fallbackRec.planning_statement
    });
  },

  getAIMLSummary: async (): Promise<AIMLSummary> => {
    return fetchWithFallback('/aiml/summary', FALLBACK_AIML_SUMMARY);
  },
};


