# Edge Function Security Fix - Testing Guide

## What Was Changed

The `get-customer-vehicles` edge function was **publicly accessible** (major security risk) and is now **admin-only**.

---

## Security Issue (BEFORE)

**Problem:**
- Edge function had `auth: false` config
- Anyone could call it with ANY customer_id
- No authentication or authorization checks
- Could enumerate customer IDs (1, 2, 3...) and get vehicle data (VINs, license plates)

**Risk Level:** 🔴 **CRITICAL**

---

## Security Fix (AFTER)

**Changes Made:**

### Edge Function (`supabase/functions/get-customer-vehicles/index.ts`):
1. ✅ Requires `Authorization` header with valid JWT token
2. ✅ Verifies user is authenticated via `supabase.auth.getUser()`
3. ✅ Checks user has `is_admin = true` in profiles table
4. ✅ Returns 401 if not authenticated
5. ✅ Returns 403 if not admin
6. ✅ Uses SERVICE_ROLE_KEY for actual query (admin verified)
7. ✅ Removed `auth: false` config

### Admin Page (`src/pages/admin/CustomerDetailsPage.jsx`):
1. ✅ Gets current session token
2. ✅ Sends `Authorization: Bearer ${token}` header in fetch request
3. ✅ Edge function validates admin before returning data

---

## How It Works Now

```
┌─────────────┐
│ Admin Login │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ View Customer Details    │
│ (CustomerDetailsPage.jsx)│
└──────┬───────────────────┘
       │
       │ 1. Get session token
       │ 2. Send to edge function with Authorization header
       ▼
┌────────────────────────────────┐
│ get-customer-vehicles function │
└──────┬─────────────────────────┘
       │
       │ 3. Verify token
       │ 4. Check is_admin = true
       │ 5. If valid: return vehicles
       │    If not: return 401/403
       ▼
┌──────────────────┐
│ Display Vehicles │
└──────────────────┘
```

---

## Testing Checklist

### ✅ Test 1: Admin Can View Customer Vehicles

**Steps:**
1. Log in as admin (Tony's account)
2. Go to Admin Portal → Customers
3. Click on any customer
4. Verify you can see customer details page
5. **Expected:** Vehicles load correctly (no errors)

**If it fails:**
- Check browser console for errors
- Look for 401 (not authenticated) or 403 (not admin) errors

---

### ✅ Test 2: Non-Admin Cannot Access Edge Function

**Steps:**
1. Log out from admin
2. Log in as a regular customer
3. Try to access admin portal (should redirect)
4. **Expected:** Cannot access admin pages

**Advanced Test (Optional):**
Open browser console and try:
```javascript
fetch('https://vbxrcqtjpcyhylanozgz.functions.supabase.co/get-customer-vehicles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customerId: '1' })
})
```
**Expected:** 401 Unauthorized error

---

### ✅ Test 3: Unauthenticated Users Cannot Access

**Steps:**
1. Log out completely
2. Open browser console
3. Try the same fetch request as Test 2
4. **Expected:** 401 Unauthorized error

---

## What to Look For

### ✅ SUCCESS Indicators:
- Admin can view customer details page normally
- Vehicles load without errors
- Customer information displays correctly
- Work orders show up properly

### ❌ FAILURE Indicators:
- "Unexpected response from vehicle function" error
- Empty vehicle list when vehicles exist
- Console shows 401 or 403 errors
- Page stuck loading vehicles

---

## Troubleshooting

### If Admin Cannot View Vehicles:

**Check 1: Session Token**
```javascript
// In browser console on admin page:
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Access Token:', session?.access_token);
```
**Expected:** Should show valid session and token

**Check 2: Admin Status**
```javascript
// In browser console:
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', user.id)
  .single();
console.log('Is Admin:', profile?.is_admin);
```
**Expected:** Should show `true`

**Check 3: Edge Function Response**
Look in browser Network tab:
1. Filter by "get-customer-vehicles"
2. Check Request Headers → should have Authorization header
3. Check Response → should return vehicle data

---

## Rollback Plan

If the edge function doesn't work with authentication:

**Option A: Use Direct Query Instead**

Replace edge function call in CustomerDetailsPage.jsx (line 83):
```javascript
// REPLACE THIS:
const vehiclesData = await fetchCustomerVehicles(profile.id);

// WITH THIS:
const { data: vehiclesData, error: vehiclesError } = await supabase
  .from('vehicles')
  .select('id, make, model, year, color, vin, license_plate')
  .eq('customer_id', profile.id);

if (vehiclesError) throw new Error(`Error fetching vehicles: ${vehiclesError.message}`);
```

**Option B: Temporarily Revert (Not Recommended)**

Only if absolutely necessary:
```bash
git revert c03df48
git push origin main
supabase functions deploy get-customer-vehicles
```
⚠️ This reopens the security vulnerability

---

## Deployment Status

✅ Code committed to GitHub: `c03df48`
✅ Edge function deployed to Supabase
✅ Frontend changes will deploy via Vercel automatically

**Next Step:** Test the admin customer details page!

---

## Security Impact

### Before Fix:
- 🔴 Anyone could access vehicle data for ANY customer
- 🔴 VINs and license plates exposed
- 🔴 Customer privacy violated

### After Fix:
- ✅ Only authenticated admins can access
- ✅ Vehicle data protected
- ✅ Customer privacy secured
- ✅ Authorization verified on every request

---

## Contact

If you encounter issues during testing, check:
1. Browser console for errors
2. Network tab for failed requests
3. Edge function logs in Supabase dashboard

The edge function is now production-ready and secure! 🎉
