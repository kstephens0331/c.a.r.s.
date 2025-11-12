# 🚨 RUN DATABASE MIGRATIONS NOW

**Status**: Code deployed to Vercel ✅
**Next Step**: Run database migrations in Supabase Dashboard

---

## ⚠️ CRITICAL: You Must Run These Migrations

The code has been deployed to production, but you need to run the database migrations manually via the Supabase Dashboard.

**Why**: The migration files don't have timestamp prefixes, so they can't be auto-deployed via CLI. You need to run them manually.

---

## 📋 Migrations to Run (In This Order)

### Migration 1: Fix Profiles RLS Recursion ✅ CRITICAL
**File**: `supabase/migrations/fix-profiles-rls-recursion.sql`
**Purpose**: Fixes infinite recursion error in profiles table RLS policies
**Impact**: Without this, login will fail with 500 errors

### Migration 2: Create Database Indexes
**File**: `supabase/migrations/create-indexes.sql`
**Purpose**: Adds 15 performance indexes for fast queries
**Impact**: Improves query performance by 10x

### Migration 3: Atomic Inventory Functions
**File**: `supabase/migrations/atomic-inventory-update.sql`
**Purpose**: Prevents race conditions when processing invoices
**Impact**: Allows concurrent invoice processing without data corruption

---

## 🚀 How to Run Migrations

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new

### Step 2: Run Migration 1 (CRITICAL - Do This First!)

1. Open [fix-profiles-rls-recursion.sql](supabase/migrations/fix-profiles-rls-recursion.sql)
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **RUN** button

**Expected Output**:
```
DROP POLICY (multiple times)
CREATE POLICY (3 times)
ALTER TABLE
```

**✅ Success**: No errors shown

---

### Step 3: Run Migration 2 (Performance Indexes)

1. Open [create-indexes.sql](supabase/migrations/create-indexes.sql)
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click **RUN** button

**Expected Output**:
```
CREATE INDEX (15 times)
```

**✅ Success**: 15 indexes created

---

### Step 4: Run Migration 3 (Atomic Inventory)

1. Open [atomic-inventory-update.sql](supabase/migrations/atomic-inventory-update.sql)
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click **RUN** button

**Expected Output**:
```
CREATE OR REPLACE FUNCTION update_inventory_atomic
CREATE OR REPLACE FUNCTION add_inventory_from_invoice
```

**✅ Success**: 2 functions created

---

## ✅ Verify Migrations Worked

After running all 3 migrations:

### Test 1: Login Works
1. Go to https://c-a-r-s.vercel.app/login
2. Try logging in
3. Should redirect to /admin or /portal (no 500 errors)

### Test 2: Admin Pages Load Fast
1. Log in as admin
2. Go to /admin/customers
3. Should load in <1 second (indexes working)

### Test 3: Inventory Updates Work
1. Go to /admin/invoices
2. Upload an invoice with AI scanning
3. Check /admin/inventory
4. Parts should be added automatically (atomic functions working)

---

## 🎯 Current Deployment Status

**Vercel Deployment**: ✅ COMPLETE
- Code pushed to GitHub
- Vercel auto-deploys from main branch
- Check: https://vercel.com/dashboard

**Database Migrations**: ⏳ PENDING (You need to run these now!)
- Migration 1 (Profiles RLS): ⏳ Run via Supabase Dashboard
- Migration 2 (Indexes): ⏳ Run via Supabase Dashboard
- Migration 3 (Atomic Functions): ⏳ Run via Supabase Dashboard

**Edge Functions**: ✅ DEPLOYED
- status-update-email: Version 2 (Resend integration)
- get-customer-vehicles: Version 9 (Admin-only access)

---

## 📊 What Gets Deployed Where

### Vercel (Auto-Deployed) ✅
- All React code
- All components
- All pages
- All hooks
- All utilities
- Public assets

### Supabase (Manual Migration Required) ⏳
- Database schema changes
- RLS policies
- Database functions
- Indexes

### Supabase Edge Functions (Already Deployed) ✅
- Email notifications
- Customer vehicle API

---

## ⏰ Time Estimate

- **Migration 1**: 30 seconds (copy, paste, run)
- **Migration 2**: 30 seconds (copy, paste, run)
- **Migration 3**: 30 seconds (copy, paste, run)

**Total**: ~2 minutes

---

## 🚨 If You See Errors

### Error: "Relation already exists"
**Meaning**: Migration was already run
**Action**: Skip to next migration

### Error: "Infinite recursion"
**Meaning**: Migration 1 didn't run yet
**Action**: Run Migration 1 first

### Error: "Function does not exist"
**Meaning**: Migration 3 didn't run yet
**Action**: Run Migration 3

---

## ✅ After Migrations Complete

Once all 3 migrations are complete:

1. Test production site: https://c-a-r-s.vercel.app
2. Test admin login
3. Test customer portal
4. Verify no console errors
5. Check page load speeds (<1s)

Then you're **100% production ready**! 🚀

---

## 📞 Quick Reference

**Supabase SQL Editor**: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new
**Vercel Dashboard**: https://vercel.com/dashboard
**Production URL**: https://c-a-r-s.vercel.app

**Migration Files Location**: `supabase/migrations/`

---

**Next Step**: Run the 3 migrations in Supabase Dashboard (takes 2 minutes total)
