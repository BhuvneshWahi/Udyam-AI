-- ============================================================================
-- UDYAM AI — 003_rls_policies.sql
-- Row Level Security (RLS) Policies for Multi-Tenant Data Isolation
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_actions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. Profiles Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. Businesses Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view their businesses"
    ON public.businesses FOR SELECT
    USING (id IN (SELECT public.get_user_business_ids()));

CREATE POLICY "Authenticated users can create businesses"
    ON public.businesses FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Owners and Admins can update business info"
    ON public.businesses FOR UPDATE
    USING (public.is_business_role(id, ARRAY['OWNER', 'ADMIN']))
    WITH CHECK (public.is_business_role(id, ARRAY['OWNER', 'ADMIN']));

CREATE POLICY "Only Owners can delete a business"
    ON public.businesses FOR DELETE
    USING (public.is_business_role(id, ARRAY['OWNER']));

-- ----------------------------------------------------------------------------
-- 3. Business Members Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view other members in their business"
    ON public.business_members FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Owners and Admins can invite/add members"
    ON public.business_members FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN'])
        OR (user_id = auth.uid() AND role = 'OWNER') -- Allows initial business creator to add self
    );

CREATE POLICY "Only Owners can modify roles"
    ON public.business_members FOR UPDATE
    USING (public.is_business_role(business_id, ARRAY['OWNER']))
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER']));

CREATE POLICY "Owners can remove members or users can leave"
    ON public.business_members FOR DELETE
    USING (
        public.is_business_role(business_id, ARRAY['OWNER'])
        OR user_id = auth.uid()
    );

-- ----------------------------------------------------------------------------
-- 4. Products Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view business products"
    ON public.products FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can insert products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Staff, Admins, and Owners can update products"
    ON public.products FOR UPDATE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']))
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Owners and Admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));

-- ----------------------------------------------------------------------------
-- 5. Sales Records Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view sales records"
    ON public.sales_records FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can insert sales records"
    ON public.sales_records FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Staff, Admins, and Owners can update sales records"
    ON public.sales_records FOR UPDATE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']))
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Owners and Admins can delete sales records"
    ON public.sales_records FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));

-- ----------------------------------------------------------------------------
-- 6. Customers Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view customers"
    ON public.customers FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can insert customers"
    ON public.customers FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Staff, Admins, and Owners can update customers"
    ON public.customers FOR UPDATE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']))
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Owners and Admins can delete customers"
    ON public.customers FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));

-- ----------------------------------------------------------------------------
-- 7. Invoices Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view invoices"
    ON public.invoices FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can insert invoices"
    ON public.invoices FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Staff, Admins, and Owners can update invoices"
    ON public.invoices FOR UPDATE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']))
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Owners and Admins can delete invoices"
    ON public.invoices FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));

-- ----------------------------------------------------------------------------
-- 8. Compliance Filings Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view compliance filings"
    ON public.compliance_filings FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can insert compliance filings"
    ON public.compliance_filings FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Staff, Admins, and Owners can update compliance filings"
    ON public.compliance_filings FOR UPDATE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']))
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Owners and Admins can delete compliance filings"
    ON public.compliance_filings FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));

-- ----------------------------------------------------------------------------
-- 9. Documents Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view documents"
    ON public.documents FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can upload documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Staff, Admins, and Owners can update documents"
    ON public.documents FOR UPDATE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']))
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Owners and Admins can delete documents"
    ON public.documents FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));

-- ----------------------------------------------------------------------------
-- 10. Notifications Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view business notifications"
    ON public.notifications FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can mark notifications read"
    ON public.notifications FOR UPDATE
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "System and staff can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Owners and Admins can delete notifications"
    ON public.notifications FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));

-- ----------------------------------------------------------------------------
-- 11. Daily Actions Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view daily actions"
    ON public.daily_actions FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can update daily actions"
    ON public.daily_actions FOR UPDATE
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Staff, Admins, and Owners can insert daily actions"
    ON public.daily_actions FOR INSERT
    TO authenticated
    WITH CHECK (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN', 'STAFF']));

CREATE POLICY "Owners and Admins can delete daily actions"
    ON public.daily_actions FOR DELETE
    USING (public.is_business_role(business_id, ARRAY['OWNER', 'ADMIN']));
