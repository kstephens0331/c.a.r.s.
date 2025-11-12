-- ============================================================================
-- Create indexes for performance optimization
-- ============================================================================
-- These indexes are based on query patterns found in the application code
-- ============================================================================

-- Frequently queried in portal pages (MyVehicles, RepairUpdates, RepairPhotos)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Joined frequently in work order queries
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);

-- Primary foreign key for fetching work orders
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle_id ON work_orders(vehicle_id);

-- Filtered and grouped by status in WorkOrdersListView
CREATE INDEX IF NOT EXISTS idx_work_orders_current_status ON work_orders(current_status);

-- Filtered for overdue work order detection
CREATE INDEX IF NOT EXISTS idx_work_orders_estimated_completion_date ON work_orders(estimated_completion_date);

-- Frequently queried to display parts for each work order
CREATE INDEX IF NOT EXISTS idx_work_order_parts_work_order_id ON work_order_parts(work_order_id);

-- Queried to display documents for each work order
CREATE INDEX IF NOT EXISTS idx_customer_documents_work_order_id ON customer_documents(work_order_id);

-- Queried in RepairPhotos page to show customer documents
CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);

-- Used for part lookup when adding to work orders
CREATE INDEX IF NOT EXISTS idx_inventory_part_number ON inventory(part_number);

-- For filtering/searching by supplier
CREATE INDEX IF NOT EXISTS idx_inventory_supplier ON inventory(supplier);

-- Foreign key to invoices table
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- Used in RLS policies and admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ============================================================================
-- Composite indexes for complex queries
-- ============================================================================

-- For overdue work order queries filtered by status
CREATE INDEX IF NOT EXISTS idx_work_orders_status_est_date ON work_orders(current_status, estimated_completion_date);

-- For filtering documents by work order and type
CREATE INDEX IF NOT EXISTS idx_customer_documents_wo_type ON customer_documents(work_order_id, document_type);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to see all indexes:
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;
-- ============================================================================
