# Future Email Enhancement Options

## Overview
This document outlines potential email notification enhancements for the C.A.R.S collision shop management system. All enhancements use the existing **Resend** email service.

**Current Status**: Only status update emails are implemented (via `status-update-email` edge function)

---

## 1. Welcome Email (New Customer Registration)

### Trigger
When a new customer account is created

### Purpose
- Welcome new customers to the portal
- Explain portal features
- Provide login instructions
- Set expectations for communication

### Implementation
**Edge Function**: `supabase/functions/welcome-email/index.ts`

```typescript
// Triggered by: Database trigger on customers table INSERT
// or: Manual call after customer creation in admin panel
```

### Email Content
```
Subject: Welcome to C.A.R.S Collision & Refinish!

Hi [Customer Name],

Welcome to C.A.R.S Collision & Refinish Shop! We're excited to work with you on your vehicle repair.

Your Customer Portal:
You can now access your customer portal at:
https://collisionandrefinish.com/login

Portal Features:
✅ Track repair progress in real-time
✅ View photos of your vehicle during repairs
✅ Access estimates and invoices
✅ See timeline updates

We'll send you email updates as your repair progresses.

Questions? Call us at (832) 844-5458

Thank you for choosing C.A.R.S!

- The C.A.R.S Team
```

---

## 2. Work Order Created Email

### Trigger
When a new work order is created for a customer's vehicle

### Purpose
- Confirm work order creation
- Provide work order number for reference
- Set timeline expectations
- Include estimate (if available)

### Implementation
**Edge Function**: `supabase/functions/work-order-created-email/index.ts`

```typescript
// Triggered by: Admin creating work order in admin panel
// Call from: src/pages/admin/WorkOrders.jsx after successful work order creation
```

### Email Content
```
Subject: New Work Order Created - [Year Make Model]

Hi [Customer Name],

We've created a new work order for your vehicle:

Vehicle: [Year Make Model]
Work Order #: [WO-XXXX]
Status: [Current Status]
Estimated Completion: [Date]

What's Next:
1. We'll perform a detailed inspection
2. You'll receive regular status updates via email
3. Track progress anytime in your customer portal

View Work Order: [Portal Link]

Estimate: [If available, include PDF link or dollar amount]

Questions? Call us at (832) 844-5458

Thank you for choosing C.A.R.S!
```

---

## 3. Ready for Pickup Reminder

### Trigger
When work order status changes to "Ready for Pickup"

### Purpose
- Notify customer vehicle is ready
- Provide pickup instructions
- Include payment information
- Confirm business hours

### Implementation
**Edge Function**: `supabase/functions/ready-for-pickup-email/index.ts`

```typescript
// Triggered by: Status change to "Ready for Pickup"
// Enhancement to existing status-update-email edge function
// Or: Separate edge function with more detailed pickup info
```

### Email Content
```
Subject: 🎉 Your [Year Make Model] is Ready for Pickup!

Hi [Customer Name],

Great news! Your vehicle is ready for pickup!

Vehicle: [Year Make Model]
Work Order #: [WO-XXXX]

Pickup Information:
📍 Address: [Shop Address]
📞 Phone: (832) 844-5458
🕐 Hours: Mon-Fri 8AM-6PM, Sat 9AM-2PM

Payment:
Final Amount: $[Total]
Payment Methods: Cash, Check, Credit/Card

What to Bring:
- Photo ID
- Insurance documents (if applicable)
- Work Order #: [WO-XXXX]

Questions? Call us at (832) 844-5458

We look forward to seeing you soon!

View Final Invoice: [Portal Link]
```

---

## 4. Estimate Approval Request

### Trigger
When estimate is ready and awaiting customer approval

### Purpose
- Request approval for repair estimate
- Include detailed breakdown
- Provide easy approval method
- Set urgency/timeline

### Implementation
**Edge Function**: `supabase/functions/estimate-approval-email/index.ts`

```typescript
// Triggered by: Admin marking estimate as "Pending Approval"
// Call from: src/pages/admin/WorkOrders.jsx
```

### Email Content
```
Subject: Estimate Ready for Approval - [Year Make Model]

Hi [Customer Name],

We've completed the inspection of your vehicle and prepared an estimate for the repairs.

Vehicle: [Year Make Model]
Work Order #: [WO-XXXX]

Estimate Summary:
Parts: $[Parts Total]
Labor: $[Labor Total]
Tax: $[Tax]
---
Total: $[Grand Total]

View Detailed Estimate: [PDF Link or Portal Link]

Next Steps:
Please review the estimate and let us know if you'd like to proceed with the repairs.

✅ Approve: Call us at (832) 844-5458
📧 Questions: Reply to this email

Once approved, we'll order parts and begin work immediately.

Thank you for choosing C.A.R.S!
```

---

## 5. Parts Ordered Confirmation

### Trigger
When parts are ordered for a work order

### Purpose
- Confirm parts have been ordered
- Provide estimated arrival date
- Update timeline expectations

### Implementation
**Edge Function**: Enhancement to existing `status-update-email` function

```typescript
// Already partially implemented via status updates
// Could be enhanced with:
// - Specific parts list
// - Estimated arrival dates
// - Timeline updates
```

### Email Content
```
Subject: Parts Ordered for Your [Year Make Model]

Hi [Customer Name],

We've ordered the parts needed for your vehicle repair!

Vehicle: [Year Make Model]
Work Order #: [WO-XXXX]

Parts Ordered:
[List of major parts, if desired]

Estimated Arrival: [Date]
Expected Repair Start: [Date]
Estimated Completion: [Date]

We'll notify you as soon as parts arrive and repairs begin.

Track Progress: [Portal Link]

Questions? Call us at (832) 844-5458
```

---

## 6. Payment Receipt Email

### Trigger
When invoice is marked as "Paid"

### Purpose
- Confirm payment received
- Provide receipt for records
- Thank customer
- Request feedback/review

### Implementation
**Edge Function**: `supabase/functions/payment-receipt-email/index.ts`

```typescript
// Triggered by: Invoice status change to "Paid"
// Call from: src/pages/admin/Invoices.jsx
```

### Email Content
```
Subject: Payment Receipt - [Year Make Model]

Hi [Customer Name],

Thank you for your payment!

Vehicle: [Year Make Model]
Work Order #: [WO-XXXX]
Invoice #: [INV-XXXX]

Payment Details:
Amount Paid: $[Total]
Payment Date: [Date]
Payment Method: [Method]

Download Receipt: [PDF Link]

We appreciate your business! If you were satisfied with our service, we'd love if you could leave us a review:

📝 Leave a Review: [Google Review Link or other platform]

Questions about your receipt? Call us at (832) 844-5458

Thank you for choosing C.A.R.S Collision & Refinish!
```

---

## 7. Repair Delay Notification

### Trigger
When estimated completion date is extended

### Purpose
- Proactively communicate delays
- Maintain transparency
- Provide updated timeline
- Explain reason for delay (optional)

### Implementation
**Edge Function**: `supabase/functions/delay-notification-email/index.ts`

```typescript
// Triggered by: Admin updating estimated_completion_date to a later date
// Call from: src/pages/admin/WorkOrders.jsx when date is changed
```

### Email Content
```
Subject: Updated Timeline - [Year Make Model]

Hi [Customer Name],

We wanted to update you on the timeline for your vehicle repair.

Vehicle: [Year Make Model]
Work Order #: [WO-XXXX]

Timeline Update:
Original Estimate: [Original Date]
New Estimate: [New Date]
Reason: [Optional: Parts delay, additional repairs needed, etc.]

We apologize for the delay and appreciate your patience. We're committed to quality work and will keep you updated on progress.

Track Progress: [Portal Link]

Questions? Call us at (832) 844-5458

Thank you for your understanding!
```

---

## 8. Appointment Reminder (Future Feature)

### Trigger
24 hours before scheduled appointment

### Purpose
- Remind customer of upcoming appointment
- Reduce no-shows
- Provide directions/parking info

### Implementation
**Edge Function**: `supabase/functions/appointment-reminder-email/index.ts`

```typescript
// Requires: Appointment scheduling feature (not yet implemented)
// Triggered by: Scheduled task (cron job) 24 hours before appointment
```

### Email Content
```
Subject: Appointment Reminder - Tomorrow at [Time]

Hi [Customer Name],

This is a friendly reminder of your appointment tomorrow:

📅 Date: [Date]
🕐 Time: [Time]
📍 Location: C.A.R.S Collision & Refinish Shop
[Address]

What to Bring:
- Vehicle keys
- Insurance documents
- Photo ID

Directions: [Google Maps Link]
Parking: [Instructions]

Need to reschedule? Call us at (832) 844-5458

See you tomorrow!
```

---

## Implementation Priority

### High Priority (Immediate Value)
1. **Welcome Email** - Sets good first impression, easy to implement
2. **Work Order Created** - Confirms job started, provides reference number
3. **Ready for Pickup** - Critical for customer pickup process

### Medium Priority (Nice to Have)
4. **Estimate Approval Request** - Streamlines approval process
5. **Payment Receipt** - Professional touch, good for records
6. **Repair Delay Notification** - Proactive communication, builds trust

### Low Priority (Future Enhancements)
7. **Parts Ordered Confirmation** - Covered by status updates
8. **Appointment Reminder** - Requires appointment scheduling feature

---

## Technical Implementation Notes

### All email functions follow the same pattern:

1. **Edge Function Structure**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  // 1. Parse request body
  // 2. Fetch relevant data (work order, customer, vehicle)
  // 3. Format email HTML
  // 4. Send via Resend API
  // 5. Return success/error response
})
```

2. **Resend API Call**:
```typescript
const resendApiKey = Deno.env.get('RESEND_API_KEY')

const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'C.A.R.S Collision <onboarding@resend.dev>',
    to: customer.email,
    subject: 'Email Subject',
    html: 'HTML content here'
  })
})
```

3. **Frontend Integration**:
```typescript
// Call from React component
const { data, error } = await supabase.functions.invoke('email-function-name', {
  body: { workOrderId: 123 }
})
```

### Email HTML Template Best Practices
- Use inline CSS (email clients strip `<style>` tags)
- Keep width under 600px for mobile compatibility
- Use tables for layout (better email client support)
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Include plain text fallback
- Brand colors: #212121 (dark gray), #e53935 (red)

---

## Current Configuration

**Email Service**: Resend
**API Key**: Already configured in Supabase secrets as `RESEND_API_KEY`
**From Address**: `C.A.R.S Collision <onboarding@resend.dev>` (test domain)
**Existing Edge Function**: `status-update-email` (deployed and working)

**For Custom Domain Email**:
To use a custom email like `notifications@collisionandrefinish.com`:
1. Verify domain in Resend dashboard
2. Add DNS records
3. Update `from` address in edge functions

---

## Cost Considerations

**Resend Pricing**:
- Free tier: 100 emails/day, 3,000 emails/month
- Pay-as-you-go: $1 per 1,000 emails after free tier

**Estimated Monthly Costs** (assuming 50 work orders/month):
- Status updates: ~200 emails (4 updates per work order)
- Welcome emails: 50 emails
- Work order created: 50 emails
- Ready for pickup: 50 emails
- Payment receipts: 50 emails
- **Total**: ~400 emails/month

**Cost**: $0 (under free tier)

---

## Testing Recommendations

Before deploying any new email edge function:

1. **Local Testing**:
```bash
supabase functions serve email-function-name --env-file .env.local
```

2. **Test with Real Email**:
```bash
curl -X POST http://localhost:54321/functions/v1/email-function-name \
  -H "Content-Type: application/json" \
  -d '{"workOrderId": 1}'
```

3. **Deploy to Production**:
```bash
supabase functions deploy email-function-name
```

4. **Monitor Logs**:
```bash
supabase functions logs email-function-name
```

---

## Conclusion

These email enhancements would provide a more complete customer communication experience. They can be implemented incrementally based on business priority and customer feedback.

**Current Status**: Status update emails are working perfectly via Resend. Additional email triggers can be added using the same proven infrastructure.

**Questions?** Reference the existing `status-update-email` edge function as a template for any new email implementations.
