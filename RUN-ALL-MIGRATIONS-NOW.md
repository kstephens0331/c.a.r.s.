# 🚨 RUN ALL SUPABASE MIGRATIONS NOW

**Status**: Code deployed, database migrations pending
**Impact**: Critical features blocked until migrations run
**Time**: 5 minutes total

---

## 🎯 What's Broken Without These Migrations

1. ❌ **Login fails** - Profiles RLS causing infinite recursion
2. ❌ **Admin access blocked** - Cannot view customers or create work orders
3. ❌ **AI invoice extraction fails** - Admin verification failing
4. ⚠️ **No atomic inventory** - Race conditions possible (optional)

## ✅ What Works After Migrations

1. ✅ **Login works** - Admin and customer routing functional
2. ✅ **Admin has full access** - View all customers, create work orders
3. ✅ **AI invoice extraction works** - Claude AI extracts invoice data
4. ✅ **Inventory protected** - Concurrent invoice processing safe

---

## ⚡ QUICK START (Run These 3 Migrations)

Go to: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new

---

### 🚨 MIGRATION 1: Fix Profiles RLS (CRITICAL - 30 seconds)

**Why**: Login currently fails with infinite recursion error
**Impact**: Without this, NO ONE can log in

**SQL to run**:
```sql
-- FIX: Infinite Recursion in Profiles RLS Policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

CREATE POLICY "users_select_own_profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

**Expected**: DROP POLICY (9x), CREATE POLICY (3x), ALTER TABLE

---

### 🚨 MIGRATION 2: Add Admin Access Policies (CRITICAL - 2 minutes)

**Why**: Admin cannot access customer data or create work orders
**Impact**: Without this, admin portal is completely non-functional

**SQL Location**: `supabase/migrations/add-admin-access-policies.sql` (520 lines)

**OR run this abbreviated version** (creates most important policies):

```sql
-- CUSTOMERS - Admin Access
CREATE POLICY "admins_view_all_customers" ON customers FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_customers" ON customers FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_customers" ON customers FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_customers" ON customers FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- VEHICLES - Admin Access
CREATE POLICY "admins_view_all_vehicles" ON vehicles FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_vehicles" ON vehicles FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_vehicles" ON vehicles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_vehicles" ON vehicles FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- WORK_ORDERS - Admin Access
CREATE POLICY "admins_view_all_work_orders" ON work_orders FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_work_orders" ON work_orders FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_work_orders" ON work_orders FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_work_orders" ON work_orders FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- WORK_ORDER_PARTS - Admin Access
CREATE POLICY "admins_view_all_work_order_parts" ON work_order_parts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_work_order_parts" ON work_order_parts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_work_order_parts" ON work_order_parts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_work_order_parts" ON work_order_parts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- INVENTORY - Admin Access
CREATE POLICY "admins_view_all_inventory" ON inventory FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_inventory" ON inventory FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_inventory" ON inventory FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_inventory" ON inventory FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- INVOICES - Admin Access
CREATE POLICY "admins_view_all_invoices" ON invoices FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_invoices" ON invoices FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_invoices" ON invoices FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_invoices" ON invoices FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- INVOICE_LINE_ITEMS - Admin Access
CREATE POLICY "admins_view_all_invoice_line_items" ON invoice_line_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_invoice_line_items" ON invoice_line_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_invoice_line_items" ON invoice_line_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_invoice_line_items" ON invoice_line_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- CUSTOMER_DOCUMENTS - Admin Access
CREATE POLICY "admins_view_all_customer_documents" ON customer_documents FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_customer_documents" ON customer_documents FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_customer_documents" ON customer_documents FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_customer_documents" ON customer_documents FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- REPAIR_PHOTOS - Admin Access
CREATE POLICY "admins_view_all_repair_photos" ON repair_photos FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_insert_repair_photos" ON repair_photos FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_update_all_repair_photos" ON repair_photos FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admins_delete_repair_photos" ON repair_photos FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
```

**Expected**: CREATE POLICY (36x)

**Full SQL**: See `supabase/migrations/add-admin-access-policies.sql` for all policies

---

### Migration 3: Atomic Inventory Functions (Optional - 1 minute)

**Why**: Prevents race conditions in concurrent invoice processing
**Impact**: Without this, rare data corruption possible

**SQL Location**: See `DEPLOYMENT-COMPLETE.md` for full SQL (173 lines)

**Skip if**: You're in a hurry, can add later

---

## ✅ After Running Migrations - Test

### Test 1: Login Works
1. Go to https://c-a-r-s.vercel.app/login
2. Log in with admin credentials
3. Should redirect to /admin ✅
4. No console errors ✅

### Test 2: Admin Access
1. Go to /admin/customers
2. Click on any customer
3. Should see customer details ✅
4. Should see vehicles ✅
5. Should see work orders ✅

### Test 3: Create Work Order
1. From customer details
2. Click "Create Work Order"
3. Fill in details
4. Should save successfully ✅

### Test 4: AI Invoice Extraction
1. Go to /admin/invoices
2. Upload invoice image
3. AI should extract data in 2-3 seconds ✅
4. Form should auto-populate ✅

---

## 📊 Summary of Migrations

| Migration | Critical? | Time | Impact |
|-----------|-----------|------|--------|
| 1. Profiles RLS | 🚨 YES | 30s | Login broken without this |
| 2. Admin Access | 🚨 YES | 2min | Admin portal non-functional |
| 3. Atomic Inventory | ⚠️ Optional | 1min | Prevents rare race conditions |

**Total Time**: 3.5 minutes (or 2.5 min if skipping #3)

---

## 🔍 Detailed Instructions

### Option A: Run All SQL (Recommended)
1. Open Supabase SQL Editor
2. Run Migration 1 SQL (profiles RLS)
3. Run Migration 2 SQL (admin access - full version from file)
4. Run Migration 3 SQL (atomic inventory - optional)
5. Test each feature after each migration

### Option B: Quick Fix (Minimum)
1. Run Migration 1 (profiles RLS) - **REQUIRED**
2. Run Migration 2 abbreviated version above - **REQUIRED**
3. Skip Migration 3 for now
4. Test login and admin access

---

## 🚨 If You Get Errors

### "Policy already exists"
**Fix**: That's OK! Skip to next policy

### "Infinite recursion"
**Fix**: Run Migration 1 first (profiles RLS)

### "Permission denied"
**Fix**: Make sure you're logged into Supabase dashboard as project owner

### "Table does not exist"
**Fix**: Check table names match exactly (case-sensitive)

---

## ✅ Current Status

**Code**: ✅ Deployed to Vercel
**Edge Functions**: ✅ All 3 deployed
- status-update-email (Resend)
- get-customer-vehicles (Admin-only)
- process-invoice-ai (Claude AI) ← **Just deployed!**

**API Keys**: ✅ All configured
- CLAUDE_API_KEY ✅
- RESEND_API_KEY ✅

**Database Migrations**: ⏳ **YOU NEED TO RUN THESE NOW**

---

## 🎯 Priority Order

1. **FIRST**: Run Migration 1 (Profiles RLS) - Fixes login
2. **SECOND**: Run Migration 2 (Admin Access) - Enables admin portal
3. **THIRD**: Test everything works
4. **OPTIONAL**: Run Migration 3 (Atomic Inventory) - Adds safety

---

**Run these now** and everything will be 100% operational! 🚀

**Supabase SQL Editor**: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new
