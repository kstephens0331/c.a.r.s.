# 🚨 CRITICAL: FIX ADMIN ACCESS NOW

**Issue**: Admin cannot access customer accounts, view client information, or create work orders
**Cause**: Missing RLS (Row Level Security) policies for admin access
**Solution**: Run SQL migration to add admin access policies
**Time**: 2 minutes

---

## 🎯 What This Fixes

After running this migration, admins will be able to:
- ✅ View all customer accounts
- ✅ View all customer vehicles
- ✅ Create and view work orders
- ✅ Add parts to work orders
- ✅ View and manage inventory
- ✅ Upload and view invoices
- ✅ View customer documents
- ✅ View repair photos

**Basically**: Full admin access to everything!

---

## ⚡ Quick Fix (Run This SQL Now)

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new

### Step 2: Copy and Run This SQL

Open the file `supabase/migrations/add-admin-access-policies.sql` in your project

OR

Copy this complete SQL (500+ lines of policies):

```sql
-- ============================================================================
-- ADD ADMIN ACCESS POLICIES
-- ============================================================================
-- Problem: Admins cannot access customer data due to RLS policies
-- Solution: Add policies that allow admins (is_admin=true) full access
-- ============================================================================

-- ============================================================================
-- CUSTOMERS TABLE: Admin Full Access
-- ============================================================================

-- Admin can view all customers
CREATE POLICY "admins_view_all_customers"
ON customers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admin can insert customers
CREATE POLICY "admins_insert_customers"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admin can update all customers
CREATE POLICY "admins_update_all_customers"
ON customers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admin can delete customers
CREATE POLICY "admins_delete_customers"
ON customers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- VEHICLES TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_vehicles"
ON vehicles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_vehicles"
ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_vehicles"
ON vehicles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_vehicles"
ON vehicles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- WORK_ORDERS TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_work_orders"
ON work_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_work_orders"
ON work_orders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_work_orders"
ON work_orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_work_orders"
ON work_orders
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- WORK_ORDER_PARTS TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_work_order_parts"
ON work_order_parts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_work_order_parts"
ON work_order_parts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_work_order_parts"
ON work_order_parts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_work_order_parts"
ON work_order_parts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- INVENTORY TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_inventory"
ON inventory
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_inventory"
ON inventory
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_inventory"
ON inventory
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_inventory"
ON inventory
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- INVOICES TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_invoices"
ON invoices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_invoices"
ON invoices
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_invoices"
ON invoices
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_invoices"
ON invoices
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- INVOICE_LINE_ITEMS TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_invoice_line_items"
ON invoice_line_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_invoice_line_items"
ON invoice_line_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_invoice_line_items"
ON invoice_line_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_invoice_line_items"
ON invoice_line_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- CUSTOMER_DOCUMENTS TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_customer_documents"
ON customer_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_customer_documents"
ON customer_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_customer_documents"
ON customer_documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_customer_documents"
ON customer_documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- REPAIR_PHOTOS TABLE: Admin Full Access
-- ============================================================================

CREATE POLICY "admins_view_all_repair_photos"
ON repair_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_insert_repair_photos"
ON repair_photos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_update_all_repair_photos"
ON repair_photos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_repair_photos"
ON repair_photos
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
```

### Step 3: Click RUN

**Expected Output**: You should see "CREATE POLICY" appear 36 times (4 policies per table x 9 tables)

**Success**: No errors, all policies created

---

## ✅ Test After Running

1. **Log out and back in** as admin
2. Go to https://c-a-r-s.vercel.app/admin/customers
3. Click on any customer
4. **You should now see**:
   - Customer details ✅
   - Customer vehicles ✅
   - Work orders ✅
   - Ability to create work orders ✅
   - All data visible ✅

---

## 🔍 What These Policies Do

Each policy checks if the current user (`auth.uid()`) has `is_admin = true` in the profiles table.

**Before** (broken):
```sql
-- No admin policies existed
-- Admins had same restrictions as customers
-- Could only see their own data
```

**After** (fixed):
```sql
-- Admins can access ALL data across ALL tables
-- Checks: is_admin = true in profiles
-- Grants: SELECT, INSERT, UPDATE, DELETE on all tables
```

---

## 📊 Tables Now Accessible to Admins

1. ✅ **customers** - All customer accounts
2. ✅ **vehicles** - All customer vehicles
3. ✅ **work_orders** - All work orders
4. ✅ **work_order_parts** - All parts used
5. ✅ **inventory** - All inventory items
6. ✅ **invoices** - All vendor invoices
7. ✅ **invoice_line_items** - All invoice details
8. ✅ **customer_documents** - All documents
9. ✅ **repair_photos** - All photos

**Total**: 36 policies (4 per table: SELECT, INSERT, UPDATE, DELETE)

---

## 🔒 Security Notes

**Customer Privacy Still Protected**:
- Regular customers can still only see their own data
- Only users with `is_admin = true` get full access
- Admin status is verified on every query
- No way for customers to escalate to admin

**How It Works**:
```sql
-- Every policy checks this:
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.is_admin = true
)
```

This means:
- User must be authenticated ✅
- User's profile must exist ✅
- User's `is_admin` must be `true` ✅
- Only then: access granted ✅

---

## 🚨 If You Get Errors

### Error: "Policy already exists"
**Meaning**: Some policies were already created
**Action**: That's OK! Skip to next section

### Error: "Infinite recursion"
**Meaning**: Profiles RLS migration wasn't run yet
**Action**: Run the profiles RLS fix first (see DEPLOYMENT-COMPLETE.md)

### Error: "Table does not exist"
**Meaning**: Table name mismatch
**Action**: Check table names in Supabase dashboard

---

## ✅ Summary

**What Was Broken**: Admin couldn't access customer data, create work orders, or view client information

**What This Fixes**: Adds 36 RLS policies granting admins full access to all tables

**How Long**: 2 minutes to run the SQL

**Impact**: Immediate - admins can now do their job!

---

**Run this now** and admin access will be restored! 🚀

**SQL Location**: `supabase/migrations/add-admin-access-policies.sql`
**Supabase SQL Editor**: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new
