-- Check current RLS state and policies
SELECT
  t.tablename,
  c.relrowsecurity as rls_enabled,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
LEFT JOIN pg_policies p ON p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'customers', 'vehicles', 'work_orders', 'work_order_parts',
    'inventory', 'invoices', 'invoice_line_items',
    'customer_documents', 'repair_photos', 'profiles'
  )
GROUP BY t.tablename, c.relrowsecurity
ORDER BY t.tablename;

-- Show all policies on customers table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'customers';

-- Test if admin check works
SELECT EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.is_admin = true
) as admin_check_result;
