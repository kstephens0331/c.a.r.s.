# AWS SNS SMS Setup Guide

## Overview
This guide will help you set up AWS SNS for SMS notifications in your C.A.R.S collision shop application. AWS SNS is more affordable and easier to set up than Twilio.

---

## Benefits of AWS SNS

- ✅ **No phone number purchase required** for basic SMS
- ✅ **Pay-as-you-go pricing**: $0.00645 per SMS (cheaper than Twilio)
- ✅ **AWS Free Tier**: 100 SMS per month free for 12 months
- ✅ **Reliable**: Amazon's infrastructure
- ✅ **Easy setup**: 5-10 minutes

---

## Step 1: Create AWS Account (if needed)

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card but won't charge unless you exceed free tier)

---

## Step 2: Create IAM User for SNS

1. **Go to IAM Console**: https://console.aws.amazon.com/iam/
2. Click "Users" in left sidebar → "Create user"
3. **User name**: `cars-sms-sender`
4. Click "Next"

### Attach Permissions

5. Select "Attach policies directly"
6. Search for and select: **`AmazonSNSFullAccess`**
7. Click "Next" → "Create user"

### Create Access Keys

8. Click on the newly created user (`cars-sms-sender`)
9. Go to "Security credentials" tab
10. Scroll to "Access keys" → Click "Create access key"
11. Select "Application running outside AWS"
12. Click "Next" → "Create access key"
13. **IMPORTANT**: Save these credentials (you'll only see them once):
    - `Access key ID`: Looks like `AKIAIOSFODNN7EXAMPLE`
    - `Secret access key`: Looks like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

---

## Step 3: Set Up SNS for SMS

1. **Go to SNS Console**: https://console.aws.amazon.com/sns/
2. In the left sidebar, scroll to "Text messaging (SMS)" → Click "Mobile text messaging (SMS)"

### Request Production Access (Optional but Recommended)

By default, AWS SNS is in "Sandbox mode" which limits SMS to verified phone numbers only.

**To send to any phone number:**

3. Click "Create case" under "Request production access"
4. Fill out the form:
   - **Use case type**: Transactional
   - **Use case description**: "Automated SMS notifications for auto collision shop customers about repair status updates"
   - **Monthly SMS volume**: Estimate based on your work orders (e.g., 200-500)
   - **Average message content**: "Customer status updates for vehicle repairs"
   - **Opt-out method**: "Customers can call us to opt out: (832) 844-5458"
   - **Regulatory compliance**: Confirm you comply with SMS regulations

5. Submit the request
   - **Approval time**: Usually 1-2 business days
   - **During review**: You can still send SMS to verified numbers

### Verify Phone Numbers (for Sandbox Testing)

While waiting for production approval, verify your test phone number:

6. Go to "Text messaging (SMS)" → "Mobile text messaging"
7. Click "Add phone number"
8. Enter your phone number in E.164 format: `+1XXXXXXXXXX`
9. You'll receive a verification code via SMS
10. Enter the code to verify

---

## Step 4: Configure Supabase Secrets

Now add your AWS credentials to Supabase:

```bash
# Navigate to your project
cd collision-shop

# Set AWS credentials as Supabase secrets
supabase secrets set AWS_ACCESS_KEY_ID="your_access_key_id_here"
supabase secrets set AWS_SECRET_ACCESS_KEY="your_secret_access_key_here"
supabase secrets set AWS_REGION="us-east-1"
```

**Example**:
```bash
supabase secrets set AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
supabase secrets set AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
supabase secrets set AWS_REGION="us-east-1"
```

### Verify Secrets

```bash
supabase secrets list
```

You should see:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
RESEND_API_KEY
```

---

## Step 5: Deploy Updated Edge Function

```bash
# Deploy the updated send-sms function
supabase functions deploy send-sms
```

---

## Step 6: Testing

### Test in Sandbox Mode (During Production Approval)

1. Go to admin panel: `/admin/work-orders`
2. Update a work order status for a customer with a **verified phone number**
3. Customer should receive SMS within seconds

### Test in Production Mode (After Approval)

1. Once AWS approves your request (1-2 days)
2. Test with any phone number in your customer database
3. SMS will be sent automatically when status changes

---

## AWS Regions

Choose the region closest to your customers:

| Region | Region Code | Location |
|--------|-------------|----------|
| US East (N. Virginia) | `us-east-1` | Default (recommended) |
| US West (Oregon) | `us-west-2` | West Coast |
| EU (Ireland) | `eu-west-1` | Europe |

**Note**: The edge function defaults to `us-east-1` if not specified.

---

## Pricing

### AWS SNS SMS Pricing (US)
- **Transactional SMS**: $0.00645 per message
- **Promotional SMS**: $0.00645 per message

### Example Monthly Costs
- **50 SMS/month**: $0.32
- **200 SMS/month**: $1.29
- **500 SMS/month**: $3.23

**AWS Free Tier** (first 12 months):
- 100 free SMS per month

---

## Troubleshooting

### SMS Not Sending?

1. **Check Supabase Logs**:
   ```bash
   supabase functions logs send-sms
   ```

2. **Verify AWS Credentials**:
   ```bash
   supabase secrets list
   ```

3. **Check AWS CloudWatch Logs**:
   - Go to AWS CloudWatch console
   - Look for SNS errors

### Common Errors

#### "Invalid phone number"
- Ensure phone number is in E.164 format: `+1XXXXXXXXXX`
- US numbers: `+1` + 10 digits

#### "Sandbox mode - phone not verified"
- Add the phone number to verified list in SNS console
- OR wait for production access approval

#### "Access Denied"
- Check IAM user has `AmazonSNSFullAccess` policy
- Verify AWS credentials are set correctly in Supabase secrets

---

## How It Works

1. **Admin updates work order status** in admin panel
2. **Frontend calls** Supabase edge function `send-sms`
3. **Edge function**:
   - Verifies admin authorization
   - Fetches work order details
   - Formats SMS message
   - Signs request with AWS Signature V4
   - Sends SMS via AWS SNS API
4. **Customer receives SMS** within seconds

---

## SMS Message Format

```
Hi [Customer Name]! Your [Year Make Model] (WO #[Number]) [status message]. Questions? Call us at (832) 844-5458. - C.A.R.S
```

**Example**:
```
Hi John! Your 2020 Honda Accord (WO #1234) is ready for pickup! 🎉 Questions? Call us at (832) 844-5458. - C.A.R.S
```

---

## Status Messages

| Status | SMS Message |
|--------|-------------|
| Estimate Scheduled | estimate is scheduled |
| Parts Ordered | parts have been ordered |
| Parts Received | parts have been received |
| Repairs Started | repairs have started |
| Paint | is now in the paint shop |
| Quality Check | is undergoing quality check |
| Ready for Pickup | is ready for pickup! 🎉 |
| Complete | has been completed |

---

## Security Notes

- ✅ AWS credentials stored securely in Supabase secrets (not in code)
- ✅ Edge function verifies admin authorization before sending
- ✅ Uses AWS Signature Version 4 for secure API requests
- ✅ Phone numbers normalized to E.164 format automatically
- ✅ No phone number purchase or management required

---

## Next Steps

1. ✅ Set up AWS account and IAM user
2. ✅ Configure Supabase secrets
3. ✅ Deploy edge function
4. ✅ Test with verified phone number
5. ⏳ Wait for production access approval (1-2 days)
6. ✅ Test with any customer phone number

**Questions?** Check AWS SNS documentation: https://docs.aws.amazon.com/sns/

---

## Quick Reference

### Required Supabase Secrets
```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

### Edge Function
- **Location**: `supabase/functions/send-sms/index.ts`
- **Endpoint**: `https://[your-project].supabase.co/functions/v1/send-sms`

### Frontend Integration
- **File**: `src/pages/admin/WorkOrders.jsx`
- **Trigger**: Status change in work orders
- **Behavior**: Graceful fallback if SMS fails
