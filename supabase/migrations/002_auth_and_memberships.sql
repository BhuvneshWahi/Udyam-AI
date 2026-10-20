-- ============================================================================
-- UDYAM AI — 002_auth_and_memberships.sql
-- Auth Triggers & Multi-Tenant Membership Helper Functions
-- ============================================================================

-- 1. Automatic Profile Creation Trigger on New User Signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, preferred_language)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'Hinglish')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Security Helper: Get Businesses where current authenticated user is a member
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT business_id 
    FROM public.business_members 
    WHERE user_id = auth.uid();
$$;

-- 3. Security Helper: Check if current authenticated user is a member of business_id
CREATE OR REPLACE FUNCTION public.is_business_member(target_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.business_members 
        WHERE business_id = target_business_id 
          AND user_id = auth.uid()
    );
$$;

-- 4. Security Helper: Check if current authenticated user has one of the allowed roles in business_id
CREATE OR REPLACE FUNCTION public.is_business_role(target_business_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.business_members 
        WHERE business_id = target_business_id 
          AND user_id = auth.uid()
          AND role = ANY(allowed_roles)
    );
$$;

-- 5. Security Helper: Get current authenticated user's role in business_id
CREATE OR REPLACE FUNCTION public.get_user_role_in_business(target_business_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role 
    FROM public.business_members 
    WHERE business_id = target_business_id 
      AND user_id = auth.uid()
    LIMIT 1;
$$;
