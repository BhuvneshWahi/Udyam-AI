-- ============================================================================
-- UDYAM AI — 005_storage_buckets.sql
-- Storage Buckets & Policies for Business Documents and Invoices
-- ============================================================================

-- Create private buckets for tenant documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('business-documents', 'business-documents', false, 10485760, ARRAY['application/pdf', 'text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
    ('invoices', 'invoices', false, 10485760, ARRAY['application/pdf', 'application/json']),
    ('agreements', 'agreements', false, 10485760, ARRAY['application/pdf', 'text/plain']),
    ('uploads', 'uploads', false, 20971520, NULL)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Objects RLS:
-- Objects are organized as `{business_id}/{filename}`
-- Authenticated users can only read/write files if they are members of {business_id}

-- 1. Read Policy: Members can read files in their business folder
DROP POLICY IF EXISTS "Members can access business storage objects" ON storage.objects;
CREATE POLICY "Members can access business storage objects"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id IN ('business-documents', 'invoices', 'agreements', 'uploads')
        AND (
            -- Verify user is member of the business specified in first path segment
            public.is_business_member((storage.foldername(name))[1]::uuid)
        )
    );

-- 2. Insert Policy: Staff, Admins, and Owners can upload files
DROP POLICY IF EXISTS "Staff and Admins can upload storage objects" ON storage.objects;
CREATE POLICY "Staff and Admins can upload storage objects"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('business-documents', 'invoices', 'agreements', 'uploads')
        AND (
            public.is_business_role((storage.foldername(name))[1]::uuid, ARRAY['OWNER', 'ADMIN', 'STAFF'])
        )
    );

-- 3. Delete Policy: Admins and Owners can delete files
DROP POLICY IF EXISTS "Admins and Owners can delete storage objects" ON storage.objects;
CREATE POLICY "Admins and Owners can delete storage objects"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id IN ('business-documents', 'invoices', 'agreements', 'uploads')
        AND (
            public.is_business_role((storage.foldername(name))[1]::uuid, ARRAY['OWNER', 'ADMIN'])
        )
    );
