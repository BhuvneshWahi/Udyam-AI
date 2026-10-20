-- ============================================================================
-- UDYAM AI — 001_initial_schema.sql
-- Core PostgreSQL Tables for Multi-Tenant MSME Decision Support
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE,
    phone TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'Hinglish',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    business_type TEXT NOT NULL DEFAULT 'Micro Enterprise (Manufacturing & Distribution)',
    gstin TEXT,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    city TEXT NOT NULL DEFAULT 'Pune',
    business_age_years INT DEFAULT 3,
    employee_count INT DEFAULT 15,
    annual_revenue NUMERIC(15, 2) DEFAULT 14500000.00,
    sector TEXT DEFAULT 'Auto Components & Hardware',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Business Memberships (Multi-Tenant Authorization)
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'STAFF', 'VIEWER')) DEFAULT 'OWNER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- 4. Products Table (Inventory & Valuation)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    sku_code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    stock INT NOT NULL DEFAULT 0,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    avg_daily_sales NUMERIC(8, 2) NOT NULL DEFAULT 0,
    days_remaining NUMERIC(8, 1),
    status TEXT NOT NULL CHECK (status IN ('Critical', 'Low', 'Healthy', 'Overstocked')) DEFAULT 'Healthy',
    forecast_demand_30d INT DEFAULT 0,
    suggested_reorder INT DEFAULT 0,
    sales_growth_30d NUMERIC(6, 2) DEFAULT 0,
    margin_pct NUMERIC(6, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, sku_code)
);

-- 5. Sales Trends (Monthly Aggregations)
CREATE TABLE IF NOT EXISTS public.sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    revenue NUMERIC(14, 2) NOT NULL DEFAULT 0,
    profit NUMERIC(14, 2) NOT NULL DEFAULT 0,
    orders_count INT NOT NULL DEFAULT 0,
    growth_pct NUMERIC(6, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, month)
);

-- 6. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    orders_count INT NOT NULL DEFAULT 0,
    total_spend NUMERIC(14, 2) NOT NULL DEFAULT 0,
    gstin TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, name)
);

-- 7. Invoices Table (E-Invoices & 3-Way Reconciliation)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_no TEXT NOT NULL,
    client_name TEXT NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    itc_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Matched', 'Mismatch', 'Pending', 'Paid', 'Disputed')) DEFAULT 'Pending',
    discrepancy_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, invoice_no)
);

-- 8. Compliance Filings
CREATE TABLE IF NOT EXISTS public.compliance_filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    form_name TEXT NOT NULL,
    period TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Completed', 'Pending', 'Upcoming')) DEFAULT 'Pending',
    tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, form_name, period)
);

-- 9. Documents & Contracts Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'sales',
    storage_path TEXT NOT NULL,
    records_count INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Processed',
    analysis_summary JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Business Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'System',
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'success')) DEFAULT 'info',
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Daily Operational Actions
CREATE TABLE IF NOT EXISTS public.daily_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    impact TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Operational',
    action_type TEXT NOT NULL DEFAULT 'NAVIGATE',
    target_route TEXT NOT NULL DEFAULT '/dashboard',
    urgency TEXT NOT NULL CHECK (urgency IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
