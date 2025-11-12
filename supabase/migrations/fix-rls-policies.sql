-- ============================================================================
-- CRITICAL SECURITY FIX: Enable Row Level Security (RLS) on all tables
-- ============================================================================
-- This migration adds RLS policies to prevent unauthorized data access
-- Run this IMMEDIATELY to secure your database
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- CUSTOMERS TABLE POLICIES
-- ============================================================================

-- Customers can view their own customer record
CREATE POLICY "Customers can view own record"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

-- Customers can update their own customer record
CREATE POLICY "Customers can update own record"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all customers
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can insert customers
CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update all customers
CREATE POLICY "Admins can update all customers"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete customers
CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- VEHICLES TABLE POLICIES
-- ============================================================================

-- Customers can view their own vehicles
CREATE POLICY "Customers can view own vehicles"
  ON vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = vehicles.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- Admins can view all vehicles
CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can insert vehicles
CREATE POLICY "Admins can insert vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update vehicles
CREATE POLICY "Admins can update vehicles"
  ON vehicles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete vehicles
CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- WORK_ORDERS TABLE POLICIES
-- ============================================================================

-- Customers can view work orders for their vehicles
CREATE POLICY "Customers can view own work orders"
  ON work_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vehicles
      JOIN customers ON customers.id = vehicles.customer_id
      WHERE vehicles.id = work_orders.vehicle_id
      AND customers.user_id = auth.uid()
    )
  );

-- Admins can view all work orders
CREATE POLICY "Admins can view all work orders"
  ON work_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can insert work orders
CREATE POLICY "Admins can insert work orders"
  ON work_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update work orders
CREATE POLICY "Admins can update work orders"
  ON work_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete work orders
CREATE POLICY "Admins can delete work orders"
  ON work_orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- WORK_ORDER_PARTS TABLE POLICIES
-- ============================================================================

-- Customers can view parts for their work orders
CREATE POLICY "Customers can view own work order parts"
  ON work_order_parts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM work_orders
      JOIN vehicles ON vehicles.id = work_orders.vehicle_id
      JOIN customers ON customers.id = vehicles.customer_id
      WHERE work_orders.id = work_order_parts.work_order_id
      AND customers.user_id = auth.uid()
    )
  );

-- Admins have full access to work order parts
CREATE POLICY "Admins can manage work order parts"
  ON work_order_parts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- INVENTORY TABLE POLICIES (Admin Only)
-- ============================================================================

CREATE POLICY "Admins can view inventory"
  ON inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert inventory"
  ON inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update inventory"
  ON inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete inventory"
  ON inventory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- INVOICES TABLE POLICIES (Admin Only)
-- ============================================================================

CREATE POLICY "Admins can view invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update invoices"
  ON invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete invoices"
  ON invoices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- INVOICE_LINE_ITEMS TABLE POLICIES (Admin Only)
-- ============================================================================

CREATE POLICY "Admins can manage invoice line items"
  ON invoice_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- CUSTOMER_DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Customers can view their own documents
CREATE POLICY "Customers can view own documents"
  ON customer_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM work_orders
      JOIN vehicles ON vehicles.id = work_orders.vehicle_id
      JOIN customers ON customers.id = vehicles.customer_id
      WHERE work_orders.id = customer_documents.work_order_id
      AND customers.user_id = auth.uid()
    )
  );

-- Admins can manage all documents
CREATE POLICY "Admins can manage documents"
  ON customer_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after applying the migration to verify RLS is working:
--
-- 1. Check RLS is enabled on all tables:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';
--
-- 2. View all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';
-- ============================================================================
