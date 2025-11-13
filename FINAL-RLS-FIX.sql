-- ============================================================================
-- FINAL RLS FIX - Copy this ENTIRE block into Supabase SQL Editor
-- ============================================================================
-- Go to: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new
-- Paste this ENTIRE file and click RUN
-- ============================================================================

-- STEP 1: Drop ALL existing policies on all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on customers
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.customers';
    END LOOP;

    -- Drop all policies on vehicles
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.vehicles';
    END LOOP;

    -- Drop all policies on work_orders
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.work_orders';
    END LOOP;

    -- Drop all policies on work_order_parts
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_order_parts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.work_order_parts';
    END LOOP;

    -- Drop all policies on inventory
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inventory') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.inventory';
    END LOOP;

    -- Drop all policies on invoices
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.invoices';
    END LOOP;

    -- Drop all policies on invoice_line_items
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoice_line_items') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.invoice_line_items';
    END LOOP;

    -- Drop all policies on customer_documents
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_documents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.customer_documents';
    END LOOP;

    -- Drop all policies on repair_photos
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'repair_photos') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.repair_photos';
    END LOOP;
END $$;

-- STEP 2: Create ONE simple policy per table (FOR ALL = SELECT + INSERT + UPDATE + DELETE)
-- Using FOR ALL with both USING and WITH CHECK

CREATE POLICY "admin_access_all"
ON public.customers
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.vehicles
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.work_orders
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.work_order_parts
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.inventory
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.invoices
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.invoice_line_items
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.customer_documents
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "admin_access_all"
ON public.repair_photos
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- STEP 3: Ensure RLS is ENABLED (policies won't work without this)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_photos ENABLE ROW LEVEL SECURITY;

-- STEP 4: Verify policies were created (should show 1 policy per table)
SELECT
  tablename,
  policyname,
  cmd as operations
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'customers', 'vehicles', 'work_orders', 'work_order_parts',
    'inventory', 'invoices', 'invoice_line_items',
    'customer_documents', 'repair_photos'
  )
ORDER BY tablename;

-- STEP 5: Test that admin check returns TRUE
SELECT
  id,
  is_admin,
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true as admin_check_result
FROM public.profiles
WHERE id = auth.uid();
