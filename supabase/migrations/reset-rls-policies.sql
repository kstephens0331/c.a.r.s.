-- ============================================================================
-- RESET RLS POLICIES - Drop all existing policies and start fresh
-- ============================================================================
-- Problem: Old restrictive RLS policies are blocking admin access
-- Solution: Drop ALL policies, then recreate only admin policies
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================================================

-- Drop all policies on customers table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'customers') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON customers', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on vehicles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'vehicles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON vehicles', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on work_orders table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'work_orders') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON work_orders', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on work_order_parts table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'work_order_parts') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON work_order_parts', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on inventory table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'inventory') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON inventory', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on invoices table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'invoices') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON invoices', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on invoice_line_items table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'invoice_line_items') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON invoice_line_items', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on customer_documents table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'customer_documents') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON customer_documents', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on repair_photos table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'repair_photos') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON repair_photos', r.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: CREATE SIMPLE ADMIN-ONLY POLICIES
-- ============================================================================

-- CUSTOMERS: Admin full access
CREATE POLICY "admin_all_customers" ON customers
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- VEHICLES: Admin full access
CREATE POLICY "admin_all_vehicles" ON vehicles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- WORK_ORDERS: Admin full access
CREATE POLICY "admin_all_work_orders" ON work_orders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- WORK_ORDER_PARTS: Admin full access
CREATE POLICY "admin_all_work_order_parts" ON work_order_parts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- INVENTORY: Admin full access
CREATE POLICY "admin_all_inventory" ON inventory
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- INVOICES: Admin full access
CREATE POLICY "admin_all_invoices" ON invoices
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- INVOICE_LINE_ITEMS: Admin full access
CREATE POLICY "admin_all_invoice_line_items" ON invoice_line_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- CUSTOMER_DOCUMENTS: Admin full access
CREATE POLICY "admin_all_customer_documents" ON customer_documents
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- REPAIR_PHOTOS: Admin full access
CREATE POLICY "admin_all_repair_photos" ON repair_photos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- STEP 3: VERIFY POLICIES
-- ============================================================================

-- Check that policies were created
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN (
  'customers', 'vehicles', 'work_orders', 'work_order_parts',
  'inventory', 'invoices', 'invoice_line_items',
  'customer_documents', 'repair_photos'
)
ORDER BY tablename, policyname;
