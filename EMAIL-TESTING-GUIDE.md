# Email Notification System - Testing Guide

## Status: ✅ DEPLOYED & READY

The email notification system has been updated and deployed with Resend API integration.

---

## What Was Deployed

### Edge Function: `status-update-email`
- **Location:** `supabase/functions/status-update-email/index.ts`
- **Status:** Deployed (Version 2)
- **API:** Resend (replaces Gmail)
- **API Key:** Configured in Supabase secrets ✅

### Frontend Integration
- **Location:** `src/pages/admin/WorkOrders.jsx`
- **Lines:** 156-183
- **Trigger:** Automatic when admin changes work order status

---

## How It Works

```
┌─────────────────────────────┐
│ Admin Changes Work Order    │
│ Status (WorkOrders.jsx)     │
└──────────┬──────────────────┘
           │
           │ 1. Update status in database
           │ 2. Call status-update-email function
           ▼
┌──────────────────────────────────┐
│ status-update-email Edge Function│
└──────────┬───────────────────────┘
           │
           │ 3. Get work order details
           │ 4. Get customer email
           │ 5. Send via Resend API
           ▼
┌──────────────────────────┐
│ Customer Receives Email  │
└──────────────────────────┘
```

---

## Email Details

### **From Address (Current):**
```
C.A.R.S Collision <onboarding@resend.dev>
```
⚠️ This is Resend's test domain

### **From Address (Recommended for Production):**
```
C.A.R.S Collision <notifications@collisionandrefinish.com>
```

### **To Address:**
Customer's email from the `customers` table

### **Subject:**
```
Repair Update: [YEAR] [MAKE] [MODEL]
Example: Repair Update: 2020 Toyota Camry
```

### **Content:**
Professional HTML email with:
- Customer name greeting
- Vehicle details (year, make, model)
- Work order number
- New status badge (red background)
- Link to customer portal
- C.A.R.S branding and footer

---

## Testing Steps

### ✅ Test 1: Basic Email Sending

**Prerequisites:**
- Have a work order with a customer who has a valid email address
- Be logged in as admin

**Steps:**
1. Go to Admin Portal → Work Orders
2. Find any work order
3. Change the status dropdown to a different status
4. Wait 2-3 seconds

**Expected Result:**
- ✅ Status updates in the database
- ✅ Success message appears
- ✅ Customer receives email within 1 minute

**Check:**
- Customer's inbox (or spam folder)
- Email should have subject: "Repair Update: [Vehicle]"

---

### ✅ Test 2: Email Content Verification

**What to Check in the Email:**
- [ ] From: C.A.R.S Collision
- [ ] Subject includes vehicle year, make, model
- [ ] Customer name appears (or "Valued Customer" if no name)
- [ ] Vehicle details are correct
- [ ] Work order number is correct
- [ ] New status is displayed in red badge
- [ ] Link to customer portal works
- [ ] Professional HTML formatting
- [ ] C.A.R.S branding present
- [ ] Footer with company info

---

### ✅ Test 3: Multiple Status Changes

**Steps:**
1. Change status from "Parts Ordered" → "Parts Received"
2. Wait for email
3. Change status from "Parts Received" → "Repairs Started"
4. Wait for email
5. Check customer received both emails

**Expected:**
- Customer gets separate email for each status change
- Each email shows the correct new status

---

### ✅ Test 4: Error Handling

**Test A: Customer with No Email**
1. Find or create a customer with blank email
2. Create work order for that customer
3. Change status
4. **Expected:** Status updates, but no email sent (warning in console)

**Test B: Invalid Email**
1. Edit customer email to invalid format (e.g., "test@")
2. Change work order status
3. **Expected:** Status updates, error logged but doesn't break page

---

## Viewing Email Logs

### Check Edge Function Logs:
1. Go to: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/functions
2. Click on `status-update-email`
3. Click "Logs" tab
4. Look for recent executions

**What to Look For:**
- ✅ "Email sent successfully"
- ❌ "Resend API error"
- ❌ "Work order not found"
- ❌ "Customer not found or no email"

---

## Resend Dashboard

Check sent emails in Resend:
1. Go to: https://resend.com/emails
2. Log in with Resend account
3. View sent emails, delivery status, opens, etc.

**Metrics Available:**
- Emails sent
- Delivery rate
- Bounce rate
- Open rate (if enabled)

---

## Common Issues & Solutions

### Issue 1: No Email Received

**Check:**
1. Customer has valid email in database
2. Check spam/junk folder
3. Check Resend dashboard for delivery status
4. Check edge function logs for errors

**Solution:**
- If email is invalid, update in Customers table
- If Resend shows bounced, email may not exist
- Check RESEND_API_KEY is set: `supabase secrets list`

---

### Issue 2: Email Sent from Wrong Address

**Current:** `onboarding@resend.dev` (test domain)

**To Fix (Production):**
1. Go to Resend dashboard: https://resend.com/domains
2. Click "Add Domain"
3. Add `collisionandrefinish.com`
4. Add DNS records provided by Resend
5. Update edge function line 56:
```typescript
from: 'C.A.R.S Collision <notifications@collisionandrefinish.com>',
```
6. Redeploy: `supabase functions deploy status-update-email`

---

### Issue 3: Status Updates But No Email

**Check Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for email-related errors

**Common Causes:**
- Edge function not deployed
- RESEND_API_KEY not set
- Customer has no email
- Network timeout (takes >30 seconds)

**Solution:**
- Redeploy edge function
- Check secrets are set
- Add valid email to customer
- Check network tab for failed requests

---

### Issue 4: Email Template Broken

**If HTML looks wrong:**
1. Email clients render HTML differently
2. Test in multiple clients (Gmail, Outlook, Apple Mail)
3. Check edge function logs for errors during send

---

## Email Limits

### Resend Free Tier:
- **3,000 emails per month**
- **100 emails per day**

### Current Usage:
Check at: https://resend.com/overview

**If you hit limits:**
- Upgrade to paid plan ($20/month for 50,000 emails)
- Or reduce frequency of status updates

---

## Manual Test (Advanced)

Test the edge function directly:

```javascript
// Run in browser console (must be logged in as admin)
const { data: { session } } = await supabase.auth.getSession();

fetch('https://vbxrcqtjpcyhylanozgz.functions.supabase.co/status-update-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`
  },
  body: JSON.stringify({
    workOrderId: 'YOUR_WORK_ORDER_ID',  // Replace with real ID
    newStatus: 'Repairs Started'
  })
}).then(r => r.json()).then(console.log);
```

**Expected Response:**
```json
{
  "success": true,
  "emailId": "abc123..."
}
```

---

## Code Locations

### Edge Function:
- **File:** `supabase/functions/status-update-email/index.ts`
- **Lines 46-135:** Resend API integration
- **Line 56:** From email address (change for production)

### Frontend Integration:
- **File:** `src/pages/admin/WorkOrders.jsx`
- **Lines 156-183:** Email sending logic
- **Trigger:** `handleStatusChange` function

### Email Template:
- **File:** `supabase/functions/status-update-email/index.ts`
- **Lines 59-121:** HTML email template

---

## Deployment Commands

```bash
# Check current deployment
supabase functions list

# Deploy email function
supabase functions deploy status-update-email

# Check secrets
supabase secrets list

# View logs
supabase functions logs status-update-email
```

---

## Next Steps for Production

1. **Add Custom Domain to Resend**
   - Add `collisionandrefinish.com` to Resend
   - Update DNS records
   - Change from email to `notifications@collisionandrefinish.com`

2. **Test with Real Customers**
   - Use actual customer emails
   - Verify they receive and can read emails
   - Check spam folder placement

3. **Monitor Usage**
   - Watch Resend dashboard for delivery rates
   - Check for bounces (invalid emails)
   - Monitor monthly email count

4. **Optional Enhancements**
   - Add email open tracking
   - Add click tracking on portal link
   - Send digest emails (daily summary of all updates)
   - Add SMS notifications (Twilio integration)

---

## Summary

✅ **Email system is READY:**
- Edge function deployed
- Resend API configured
- Frontend integration complete
- Automatic sending on status changes

✅ **Test it now:**
1. Log in as admin
2. Go to Work Orders
3. Change any status
4. Customer should receive email

✅ **For production:**
- Add custom domain to Resend
- Update from email address
- Monitor delivery rates

🎉 **The email notification system is fully functional!**
