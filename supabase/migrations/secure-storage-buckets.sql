-- ============================================================================
-- Secure Storage Buckets - Admin Only Access
-- ============================================================================
-- Makes all storage buckets private and adds admin-only access policies
-- Note: Customer access can be refined later with more specific policies
-- ============================================================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Admin access repair-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin access customer-documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin access invoice-files" ON storage.objects;

-- Make all buckets private (not publicly accessible)
UPDATE storage.buckets
SET public = false
WHERE name IN ('repair-photos', 'customer-documents', 'invoice-files');

-- ============================================================================
-- REPAIR PHOTOS BUCKET - Admin Only (for now)
-- ============================================================================

CREATE POLICY "Admin full access repair-photos"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'repair-photos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- CUSTOMER DOCUMENTS BUCKET - Admin Only (for now)
-- ============================================================================

CREATE POLICY "Admin full access customer-documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'customer-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- INVOICE FILES BUCKET - Admin Only
-- ============================================================================

CREATE POLICY "Admin full access invoice-files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'invoice-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check bucket privacy settings:
-- SELECT name, public FROM storage.buckets;
-- Should show: false for all three buckets
--
-- Check policies exist:
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects';
-- Should show 3 policies
-- ============================================================================

-- ============================================================================
-- FUTURE: Customer Access Policies (commented out for now)
-- ============================================================================
-- Uncomment these when ready to give customers access to their own files
-- You'll need to update upload code to include work_order_id in file paths
-- ============================================================================

/*
CREATE POLICY "Customers view own repair photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'repair-photos' AND
  (
    -- Admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
    OR
    -- Customers can see their own work order photos
    split_part(name, '/', 1) IN (
      SELECT work_orders.id::text
      FROM work_orders
      JOIN vehicles ON vehicles.id = work_orders.vehicle_id
      JOIN customers ON customers.id = vehicles.customer_id
      WHERE customers.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Customers view own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-documents' AND
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
    OR
    split_part(name, '/', 1) IN (
      SELECT work_orders.id::text
      FROM work_orders
      JOIN vehicles ON vehicles.id = work_orders.vehicle_id
      JOIN customers ON customers.id = vehicles.customer_id
      WHERE customers.user_id = auth.uid()
    )
  )
);
*/
