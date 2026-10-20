-- ============================================================================
-- UDYAM AI — 004_indexes.sql
-- Performance Indexes for Multi-Tenant Lookups and Filter Operations
-- ============================================================================

-- Business Members
CREATE INDEX IF NOT EXISTS idx_business_members_user_id ON public.business_members (user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business_id ON public.business_members (business_id);
CREATE INDEX IF NOT EXISTS idx_business_members_composite ON public.business_members (business_id, user_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_business_id ON public.products (business_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (business_id, sku_code);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (business_id, status);

-- Sales Records
CREATE INDEX IF NOT EXISTS idx_sales_records_business_id ON public.sales_records (business_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_month ON public.sales_records (business_id, month);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (business_id, name);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_business_id ON public.invoices (business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (business_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices (business_id, invoice_date);

-- Compliance Filings
CREATE INDEX IF NOT EXISTS idx_compliance_filings_business_id ON public.compliance_filings (business_id);
CREATE INDEX IF NOT EXISTS idx_compliance_filings_due_date ON public.compliance_filings (business_id, due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_filings_status ON public.compliance_filings (business_id, status);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_business_id ON public.documents (business_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents (business_id, file_type);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON public.notifications (business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (business_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications (business_id, created_at DESC);

-- Daily Actions
CREATE INDEX IF NOT EXISTS idx_daily_actions_business_id ON public.daily_actions (business_id);
CREATE INDEX IF NOT EXISTS idx_daily_actions_status ON public.daily_actions (business_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_daily_actions_urgency ON public.daily_actions (business_id, urgency);
