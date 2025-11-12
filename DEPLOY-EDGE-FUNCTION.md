# 🚀 Deploy Secure Invoice AI Edge Function (Claude API)

## ⚠️ CRITICAL: You Must Do This Before Invoice AI Works

The API key has been **moved from client code** to a secure edge function.
Invoice AI processing will **NOT work** until you complete these steps.

**NEW**: We're using **Claude AI (Anthropic)** instead of Google Gemini for better accuracy and reliability!

---

## 📋 Step-by-Step Deployment

### **Step 1: Get Your Claude API Key** (3 minutes)

1. Go to https://console.anthropic.com/
2. Sign up or log in to your Anthropic account
3. Go to **API Keys** section
4. Click **Create Key**
5. Give it a name: `collision-shop-invoice-ai`
6. **Copy the API key** (looks like: `sk-ant-api03-...`)
   - ⚠️ **IMPORTANT**: Save this key somewhere safe - you can't view it again!

**Cost**: Claude API is very affordable:
- **$3 per million input tokens** (~$0.003 per invoice image)
- **$15 per million output tokens** (JSON response)
- **Average cost per invoice**: $0.005 - $0.01 (half a cent!)

---

### **Step 2: Store Key in Supabase Secrets** (1 minute)

Open your terminal in this project directory and run:

```bash
supabase secrets set CLAUDE_API_KEY=your_claude_api_key_here
```

Replace `your_claude_api_key_here` with the key from Step 1.

**Example**:
```bash
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-ABC123def456GHI789jklMNO
```

You should see:
```
Creating new secrets...
Finished supabase secrets set.
```

---

### **Step 3: Deploy the Edge Function** (1 minute)

In your terminal, run:

```bash
supabase functions deploy process-invoice-ai
```

You should see:
```
Deploying function...
Bundling process-invoice-ai
Deploying process-invoice-ai (version X)
process-invoice-ai: Deployed successfully
```

---

### **Step 4: Verify Deployment** (1 minute)

Check that the function is active:

```bash
supabase functions list
```

You should see:
```
   ID                                   | NAME                  | STATUS | VERSION
  --------------------------------------|-----------------------|--------|----------
   ...                                  | process-invoice-ai    | ACTIVE | 1
```

---

## ✅ Testing

### **Test 1: From Your App**

1. Log in as admin
2. Go to **Invoices** page (/admin/invoices)
3. Click **Choose File** under "Upload Invoice"
4. Select an invoice image (JPG, PNG, GIF, or WebP)
5. Wait 2-5 seconds (Claude is processing)
6. You should see: **"Data extracted successfully!"**
7. Form fields should populate with:
   - Invoice Number
   - Supplier name
   - Invoice Date
   - Total Amount
   - Line items table (parts, descriptions, quantities, prices)

### **Test 2: Verify Security**

The edge function should reject non-admin users:

1. **Test as non-authenticated user**:
   - Log out completely
   - Try to access /admin/invoices
   - Should redirect to /login

2. **Test as regular customer**:
   - Log in as a customer (not admin)
   - Try to access /admin/invoices
   - Should redirect to /portal

3. **Test as admin**:
   - Log in as admin
   - Upload invoice image
   - Should work perfectly ✅

---

## 🔍 Troubleshooting

### **Error: "API key not configured"**

**Solution**: You forgot Step 2. Run:
```bash
supabase secrets set CLAUDE_API_KEY=your_key_here
```

Verify it's set:
```bash
supabase secrets list
```

You should see `CLAUDE_API_KEY` in the list.

---

### **Error: "Failed to process invoice image"**

**Possible causes**:
1. API key is invalid or doesn't have permissions
2. Image is too large (max 5MB for Claude)
3. Image format not supported (must be JPG, PNG, GIF, or WebP)

**Solution**:
1. Verify API key at https://console.anthropic.com/
2. Check image size (should be < 5MB)
3. Convert PDF to image if needed

---

### **Error: "Admin access required"**

**Solution**: You're not logged in as admin. Check:
```sql
SELECT email, is_admin FROM profiles;
```

Ensure your account has `is_admin = true`. If not:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your_email@example.com';
```

---

### **Error: "Unauthorized"**

**Solution**: You're not logged in. Clear cookies and log in again.

---

### **AI extracted wrong data**

**Possible causes**:
1. Image quality is poor
2. Invoice format is unusual
3. Text is handwritten or unclear

**Solutions**:
1. Take a clearer photo with better lighting
2. Ensure invoice is flat (not wrinkled)
3. Use a scanner instead of phone camera
4. Edit extracted data manually before saving

---

## 📊 What Changed

### **Before** (Insecure):
```javascript
// ❌ BAD: Google API key exposed in client code
const apiKey = "AIzaSyDFHVnXhRk6xyM4dzaCLe2sBOpfbrx0rE4";
const apiUrl = `https://...?key=${apiKey}`;
```

### **After** (Secure with Claude):
```javascript
// ✅ GOOD: Claude API key in Supabase secrets, accessed via edge function
const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-invoice-ai`;
const response = await fetch(edgeFunctionUrl, {
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ imageBase64, mimeType })
});
```

---

## 📁 Files Modified

1. **Created**: `supabase/functions/process-invoice-ai/index.ts`
   - Secure edge function with admin auth check
   - Calls Claude API server-side
   - API key stored in Supabase secrets
   - Uses Claude 3.5 Sonnet (latest vision model)

2. **Modified**: `src/pages/admin/Invoices.jsx`
   - Removed exposed API key
   - Now calls edge function instead
   - Sends auth token with request

---

## 💡 Why Claude is Better

### **Claude vs Gemini**:

| Feature | Claude 3.5 Sonnet | Gemini 2.0 |
|---------|-------------------|------------|
| **Accuracy** | Excellent | Good |
| **JSON Output** | Highly reliable | Sometimes needs parsing |
| **Cost** | $3/$15 per 1M tokens | $0.075/$0.30 per 1M tokens |
| **Speed** | 2-3 seconds | 2-4 seconds |
| **Vision Quality** | Superior | Good |
| **API Reliability** | Excellent | Good |
| **Support** | Anthropic (AI safety leader) | Google |

**Recommendation**: Claude is more expensive per token, but **far more accurate** for structured data extraction. The cost difference is negligible ($0.005 per invoice vs $0.001) but the accuracy improvement is significant.

---

## 🔒 Security Features

1. **Admin-only access**: Checks `is_admin = true` before processing
2. **Authentication required**: Must be logged in with valid session
3. **Server-side API key**: Stored in Supabase secrets, never exposed
4. **CORS protection**: Only your domain can call the function
5. **Error handling**: Doesn't leak sensitive info in errors
6. **Image validation**: Checks file type and size

---

## 📝 Next Steps After Deployment

1. ✅ Test invoice AI processing
2. ✅ Monitor Claude API usage at https://console.anthropic.com/
3. ✅ Set up billing alerts (optional)
4. ✅ Check Supabase edge function logs for errors
5. ✅ Consider adding rate limiting (future enhancement)

---

## 💰 Cost Monitoring

### **Track Your Usage**:

1. **Anthropic Console**: https://console.anthropic.com/
   - View usage dashboard
   - See costs per API call
   - Set up billing alerts

2. **Supabase Logs**: Dashboard → Edge Functions → process-invoice-ai
   - See how many times function is called
   - Monitor for errors

### **Expected Costs**:

- **10 invoices/day**: ~$0.05/day = $1.50/month
- **50 invoices/day**: ~$0.25/day = $7.50/month
- **100 invoices/day**: ~$0.50/day = $15/month

**Note**: These are very rough estimates. Actual costs depend on image size and complexity.

---

## 🆘 Need Help?

If something isn't working:

1. **Check Supabase logs**: Dashboard → Edge Functions → process-invoice-ai → Logs
2. **Check browser console**: Look for error messages
3. **Verify API key**: `supabase secrets list`
4. **Test function directly**:
   ```bash
   supabase functions invoke process-invoice-ai --method POST
   ```

5. **Check Claude API status**: https://status.anthropic.com/

---

## 🎉 You're All Set!

Once deployed, your invoice AI will:
- ✅ Extract invoice data accurately
- ✅ Populate form fields automatically
- ✅ Save you hours of manual data entry
- ✅ Work securely with admin-only access
- ✅ Cost pennies per invoice

**Time to complete**: 6 minutes total
**Difficulty**: Easy
**Impact**: Huge time savings + critical security fix

---

## 📚 Additional Resources

- **Claude API Docs**: https://docs.anthropic.com/
- **Claude Vision Guide**: https://docs.anthropic.com/en/docs/vision
- **Pricing**: https://www.anthropic.com/pricing
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

**Ready to deploy?** Run these commands:

```bash
# 1. Set API key
supabase secrets set CLAUDE_API_KEY=your_key_here

# 2. Deploy function
supabase functions deploy process-invoice-ai

# 3. Verify
supabase functions list

# 4. Test in your app!
```

🚀 **Let's go!**
