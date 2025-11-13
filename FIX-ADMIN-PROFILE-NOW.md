# 🚨 FIX ADMIN PROFILE - CRITICAL

**Issue**: Your profile doesn't exist in the database
**Impact**: ALL admin features blocked (406 errors)
**Time to Fix**: 30 seconds

---

## WHY THIS HAPPENED

When you run this query:
```sql
SELECT id, is_admin FROM profiles WHERE id = auth.uid();
```

**Result**: "No rows returned"

This means:
- You have a user account in `auth.users` ✅
- But NO profile in `profiles` table ❌
- All RLS policies check `profiles.is_admin`
- If profile doesn't exist, admin check fails
- Result: 406 Not Acceptable errors

---

## ⚡ INSTANT FIX (Run This Now)

Go to Supabase SQL Editor:
https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new

**Copy and paste this entire SQL:**

```sql
-- =====================================================
-- INSTANT FIX: Create your admin profile
-- =====================================================

-- Step 1: Create your admin profile NOW
INSERT INTO profiles (id, is_admin, created_at, updated_at)
VALUES (
  auth.uid(),
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET is_admin = true, updated_at = NOW();

-- Step 2: Verify it worked
SELECT id, is_admin, created_at
FROM profiles
WHERE id = auth.uid();
```

**Expected Output:**
```
id                                   | is_admin | created_at
-------------------------------------|----------|--------------------
<your-uuid>                          | true     | 2025-11-12 ...
```

**If you see your UUID with `is_admin = true`**: ✅ SUCCESS!

---

## 🔧 PERMANENT FIX (Prevents Future Issues)

After the instant fix, run this to auto-create profiles for all future signups:

**Location**: `supabase/migrations/create-profile-trigger.sql`

**Or copy this:**

```sql
-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin, created_at, updated_at)
  VALUES (
    NEW.id,
    false,  -- New users are NOT admin by default
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing users without profiles
INSERT INTO public.profiles (id, is_admin, created_at, updated_at)
SELECT
  u.id,
  false,  -- Existing users default to non-admin
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

---

## ✅ AFTER RUNNING THE FIX

1. **Refresh your admin portal** (Ctrl+Shift+R)
2. **Click on any customer**
3. **Expected Results**:
   - ✅ Customer details load
   - ✅ No 406 errors
   - ✅ No UUID errors
   - ✅ Can view vehicles
   - ✅ Can create work orders

---

## 🧪 TEST ALL FEATURES

After fix is applied:

### Test 1: Customer Access
1. Go to https://c-a-r-s.vercel.app/admin/customers
2. Click any customer (with or without user account)
3. Should load details ✅

### Test 2: Create Work Order
1. From customer details page
2. Click "Create Work Order"
3. Should work ✅

### Test 3: AI Invoice Extraction
1. Go to /admin/invoices
2. Upload invoice image
3. AI should extract data ✅

### Test 4: View Inventory
1. Go to /admin/inventory
2. Should see all items ✅

---

## 📊 WHAT THIS FIXES

**Before Fix:**
```
Admin logs in → auth.users record exists
                ↓
System checks profiles.is_admin
                ↓
Profile doesn't exist → Query returns NULL
                ↓
RLS policy: is_admin = NULL → FALSE
                ↓
Access denied → 406 Not Acceptable ❌
```

**After Fix:**
```
Admin logs in → auth.users record exists
                ↓
System checks profiles.is_admin
                ↓
Profile exists with is_admin = true ✅
                ↓
RLS policy: is_admin = true → TRUE
                ↓
Access granted → 200 OK ✅
```

---

## 🚨 PRIORITY

**Run the instant fix RIGHT NOW**. This is blocking ALL admin functionality:
- ❌ Cannot view customers
- ❌ Cannot create work orders
- ❌ Cannot use AI invoice extraction
- ❌ Cannot manage inventory
- ❌ Cannot upload photos
- ❌ Cannot access any admin features

**After running the instant fix**:
- ✅ All admin features work immediately
- ✅ Can access customer details
- ✅ Can create work orders
- ✅ Can use AI invoice scanning
- ✅ Full admin portal access

---

## 🎯 QUICK CHECKLIST

- [ ] Open Supabase SQL Editor
- [ ] Run instant fix SQL (Step 1 above)
- [ ] Verify: See your UUID with is_admin = true
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Test: Click on a customer
- [ ] Confirm: Customer details load ✅
- [ ] Run permanent fix SQL (Step 2 above)
- [ ] Done! 🎉

---

**Time to complete**: 30 seconds for instant fix, 2 minutes for permanent fix

**Supabase SQL Editor**: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new

**RUN THE INSTANT FIX NOW!**
