-- ============================================================================
-- VERIFY RLS POLICIES
-- ============================================================================
-- This query checks which RLS policies are currently deployed
-- ============================================================================

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN cmd = 'ALL' THEN 'ALL'
    ELSE cmd
  END AS operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'customers', 'vehicles', 'work_orders', 'work_order_parts',
  'inventory', 'invoices', 'invoice_line_items',
  'customer_documents', 'repair_photos', 'profiles'
)
ORDER BY tablename, cmd, policyname;
