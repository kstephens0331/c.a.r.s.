# 🔍 CHECK IF RLS POLICIES ARE APPLIED

**Current Error**: "Customer not found" when accessing customers
**Likely Cause**: Admin Access policies didn't apply correctly
**Solution**: Verify and re-run policies if needed

---

## 🧪 Quick Test: Check If Policies Exist

Run this SQL in Supabase to see what policies exist:

```sql
-- Check all policies on customers table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY policyname;
```

**Expected Output**: Should see policies including:
- `admins_view_all_customers`
- `admins_insert_customers`
- `admins_update_all_customers`
- `admins_delete_customers`

**If you DON'T see these** = Policies didn't apply!

---

## 🚨 CRITICAL: Re-Run Admin Access Policies

If the policies aren't there, re-run this SQL:

```sql
-- Drop existing admin policies first (in case partially applied)
DROP POLICY IF EXISTS "admins_view_all_customers" ON customers;
DROP POLICY IF EXISTS "admins_insert_customers" ON customers;
DROP POLICY IF EXISTS "admins_update_all_customers" ON customers;
DROP POLICY IF EXISTS "admins_delete_customers" ON customers;

-- Recreate admin policies
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
```

---

## 🔍 Check Your Admin Status

Run this to verify YOU are marked as admin:

```sql
-- Check if your user is admin
SELECT
  id,
  is_admin,
  created_at
FROM profiles
WHERE id = auth.uid();
```

**Expected Output**:
- Your user ID
- `is_admin = true` ✅

**If `is_admin = false`** or `is_admin = null`:
```sql
-- Fix your admin status
UPDATE profiles
SET is_admin = true
WHERE id = auth.uid();
```

---

## 🧪 Test Admin Access Directly

Run this to test if admin can query customers:

```sql
-- This should return customers if policies work
SELECT COUNT(*) as customer_count
FROM customers;
```

**Expected**: Number of customers (e.g., 5, 10, etc.)
**If Error**: Admin policies not working

---

## 🚨 Common Issues

### Issue 1: Profiles RLS Blocking Admin Check
**Symptom**: "Customer not found" error
**Cause**: The admin check `EXISTS (SELECT 1 FROM profiles WHERE ...)` fails
**Fix**: Make sure Profiles RLS migration ran first!

**Re-run Profiles RLS**:
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create simple policy
CREATE POLICY "users_select_own_profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);
```

---

### Issue 2: Policies Created But Not Working
**Symptom**: Policies exist in pg_policies but still get "not found"
**Cause**: RLS might be disabled on table
**Fix**:
```sql
-- Ensure RLS is enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
```

---

### Issue 3: Wrong User Logged In
**Symptom**: Policies exist, RLS enabled, still fails
**Cause**: Logged in as non-admin user
**Fix**:
1. Log out completely
2. Log back in with admin credentials
3. Check `is_admin` status in profiles table

---

## 📋 Complete Verification Checklist

Run these checks in order:

1. **Check policies exist**:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'customers';
   ```
   Expected: See `admins_view_all_customers` etc.

2. **Check you're admin**:
   ```sql
   SELECT is_admin FROM profiles WHERE id = auth.uid();
   ```
   Expected: `is_admin = true`

3. **Check RLS enabled**:
   ```sql
   SELECT tablename, relrowsecurity
   FROM pg_tables t
   JOIN pg_class c ON t.tablename = c.relname
   WHERE t.tablename = 'customers';
   ```
   Expected: `relrowsecurity = true`

4. **Test direct query**:
   ```sql
   SELECT COUNT(*) FROM customers;
   ```
   Expected: Number > 0

5. **Test profiles query** (this is what the policy does):
   ```sql
   SELECT 1 FROM profiles
   WHERE profiles.id = auth.uid()
   AND profiles.is_admin = true;
   ```
   Expected: Returns `1`

---

## 🎯 Most Likely Fix

Based on "Customer not found" error, run this:

```sql
-- 1. Verify you're admin
SELECT id, is_admin FROM profiles WHERE id = auth.uid();

-- 2. If is_admin is false, fix it:
UPDATE profiles SET is_admin = true WHERE id = auth.uid();

-- 3. Re-create admin view policy
DROP POLICY IF EXISTS "admins_view_all_customers" ON customers;

CREATE POLICY "admins_view_all_customers"
ON customers FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 4. Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 5. Test it works
SELECT COUNT(*) FROM customers;
```

---

## ✅ After Fix

Log out and back in, then test:
1. Go to /admin/customers
2. Click on any customer
3. Should load details ✅
4. No "Customer not found" error ✅

---

**Run these checks now** and report back what you find!

**Supabase SQL Editor**: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new
