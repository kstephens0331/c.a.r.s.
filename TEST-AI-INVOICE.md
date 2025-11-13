# 🧪 TEST AI INVOICE EXTRACTION

## ✅ Pre-Flight Checklist

Before testing, verify these are all set:

1. **RLS Policies Fixed** ✅ (You just ran FINAL-RLS-FIX.sql)
2. **Edge Function Deployed** ✅ (process-invoice-ai Version 2 ACTIVE)
3. **API Key Configured** ✅ (CLAUDE_API_KEY in secrets)
4. **Admin Profile Exists** ✅ (You confirmed is_admin = true)

All prerequisites are met! Let's test.

---

## 🧪 TEST 1: Simple Upload Test

1. **Log into admin portal**: https://c-a-r-s.vercel.app/admin
2. **Go to Invoices page**: https://c-a-r-s.vercel.app/admin/invoices
3. **Open browser console**: Press F12
4. **Click "Upload Invoice" or find the file input**
5. **Select any invoice image** (JPEG, PNG, or WebP)
6. **Watch the console for messages**

**Expected Results:**
- ✅ "Processing image with AI... This might take a moment."
- ✅ Network request to `/functions/v1/process-invoice-ai`
- ✅ Status 200 response
- ✅ "Data extracted successfully!"
- ✅ Form fields auto-populate:
  - Invoice Number
  - Supplier
  - Invoice Date
  - Total Amount
  - Line Items table shows parts

**If You Don't Have an Invoice Image:**
Use this test invoice generator:
https://invoice-generator.com/

Or download a sample from:
https://templates.invoicehome.com/

---

## 🧪 TEST 2: Check Network Request

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Upload an invoice image**
4. **Look for request** to `process-invoice-ai`
5. **Click on the request**
6. **Check Request**:
   - Method: POST
   - Headers: Authorization: Bearer <token>
   - Payload: { imageBase64: "...", mimeType: "image/jpeg" }
7. **Check Response**:
   - Status: 200
   - Body: { success: true, data: {...} }

**Common Errors and Fixes:**

### Error: 401 Unauthorized
**Cause**: Not logged in or session expired
**Fix**: Log out and log back in

### Error: 403 Forbidden
**Cause**: Not admin or profile check failed
**Fix**: Verify admin status in profiles table

### Error: 500 Internal Server Error
**Cause**: Claude API key missing or invalid
**Fix**: Check secrets: `supabase secrets list`

### Error: CORS policy blocked
**Cause**: Edge function not deployed or wrong URL
**Fix**: Verify function is ACTIVE: `supabase functions list`

---

## 🧪 TEST 3: Manual Console Test

If the UI isn't working, test the edge function directly from browser console:

1. **Open admin portal**: https://c-a-r-s.vercel.app/admin
2. **Open console**: F12
3. **Paste this code** (replace with real image data):

```javascript
// Get current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? 'Found' : 'Not found');

if (!session) {
  console.log('❌ You need to log in first');
} else {
  // Test with 1x1 pixel red PNG
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-invoice-ai`;

  console.log('Calling edge function:', edgeFunctionUrl);

  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      imageBase64: testImageBase64,
      mimeType: 'image/png'
    })
  });

  const result = await response.json();
  console.log('Response status:', response.status);
  console.log('Response:', result);

  if (response.ok) {
    console.log('✅ AI function works!');
  } else {
    console.log('❌ Error:', result.error);
  }
}
```

**Expected Output:**
```
Session: Found
Calling edge function: https://vbxrcqtjpcyhylanozgz.supabase.co/functions/v1/process-invoice-ai
Response status: 200
Response: { success: true, data: { invoiceNumber: null, supplier: null, ... } }
✅ AI function works!
```

---

## 🧪 TEST 4: Real Invoice Test

1. **Find a real invoice image** (clear, readable)
2. **Upload to Invoices page**
3. **Wait 3-5 seconds** (Claude AI processing time)
4. **Verify extracted data**:
   - Invoice number matches
   - Supplier name correct
   - Date in YYYY-MM-DD format
   - Total amount as number
   - All line items extracted
5. **Review line items table**
6. **Make any corrections needed**
7. **Submit the form**
8. **Verify invoice saved**
9. **Verify inventory updated** (if line items added)

---

## 🐛 Troubleshooting

### Issue: "Processing..." never finishes

**Check:**
1. Network tab - is request still pending?
2. Console errors - any JavaScript errors?
3. Function timeout - Claude API can take 10-15 seconds

**Fix:**
- Wait up to 30 seconds
- Check browser console for errors
- Try a smaller/simpler image

---

### Issue: "AI could not extract sufficient data"

**Causes:**
- Image quality too low
- Text not readable
- Invoice format unusual
- Claude API error

**Fix:**
- Try a clearer image
- Ensure good lighting/contrast
- Use standard invoice format
- Check Claude API dashboard for errors

---

### Issue: Data extracted but wrong

**This is normal!** AI is not perfect.

**Solution:**
- Review all extracted data
- Manually correct any errors
- Line items can be edited before submission
- This is why we have manual input fields

---

## ✅ Success Criteria

**AI Invoice Extraction Works When:**
- ✅ Upload triggers "Processing..." message
- ✅ Network request completes in 3-10 seconds
- ✅ Status 200 response
- ✅ Form fields auto-populate
- ✅ Line items appear in preview table
- ✅ Can submit and save invoice
- ✅ Inventory auto-updates with parts

---

## 📊 What Gets Extracted

**From Invoice Image:**
- **Invoice Number**: Extracted from header/top
- **Supplier**: Company name sending invoice
- **Invoice Date**: Converted to YYYY-MM-DD
- **Total Amount**: As number (no currency symbol)
- **Line Items**: Array of parts:
  - Part Number
  - Description
  - Quantity
  - Unit Price

**Auto-Inventory Update:**
When you submit the invoice, all line items automatically:
- Add to inventory if part doesn't exist
- Increase quantity if part exists
- Track supplier for each part
- Record date added

---

## 🎯 Quick Test Checklist

- [ ] Log into admin portal
- [ ] Go to /admin/invoices
- [ ] Click upload/file input
- [ ] Select invoice image
- [ ] See "Processing..." message
- [ ] Wait 3-10 seconds
- [ ] Form fields populate automatically
- [ ] Line items table shows parts
- [ ] Review extracted data
- [ ] Make corrections if needed
- [ ] Submit form
- [ ] Invoice saved ✅
- [ ] Inventory updated ✅

---

## 📞 If Nothing Works

**Run this SQL in Supabase to check admin status:**

```sql
-- Verify you're admin
SELECT id, is_admin FROM profiles WHERE id = auth.uid();

-- Should return: is_admin = true
```

**If still broken, check:**
1. Browser console for JavaScript errors
2. Network tab for failed requests
3. Supabase dashboard → Functions → process-invoice-ai → Logs

---

## 🚀 Expected Performance

- **Upload to processing**: Instant
- **AI processing time**: 3-10 seconds (depends on image size/complexity)
- **Form population**: Instant after AI completes
- **Total time**: 5-15 seconds from upload to data extracted

---

**NOW GO TEST IT!** Upload an invoice and watch the magic happen! 🎉
