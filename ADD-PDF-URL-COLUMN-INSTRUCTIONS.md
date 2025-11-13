# Add pdf_url Column to Invoices Table

## Issue
```
Error inserting invoice record: Could not find the 'pdf_url' column of 'invoices' in the schema cache
```

The code is trying to save the uploaded invoice file URL, but the `pdf_url` column doesn't exist in the `invoices` table.

## Solution
Run the SQL migration to add the column.

## Steps

### 1. Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run This SQL
```sql
-- Add pdf_url column to invoices table for storing uploaded invoice file URLs
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.invoices.pdf_url IS 'URL of the uploaded invoice file (PDF, image, etc.) stored in Supabase Storage';
```

### 3. Click "Run" or Press Ctrl+Enter

### 4. Verify Success
You should see: `Success. No rows returned`

## What This Does
- Adds a `pdf_url` column to the `invoices` table
- Type: TEXT (can store any URL string)
- Nullable: Yes (older invoices without files will have NULL)
- Purpose: Stores the Supabase Storage URL of the uploaded invoice file

## After Running SQL
1. Go back to https://c-a-r-s.vercel.app/admin/invoices
2. Hard refresh: Ctrl + Shift + R
3. Upload an invoice again
4. Should now save successfully with all extracted line items!

## What Gets Saved
When you upload an invoice:
1. **File** → Uploaded to Supabase Storage bucket: `invoice-files`
2. **Invoice Record** → Saved to `invoices` table with:
   - invoice_number: W4534112
   - supplier: HOUSTONAUTOPARTS.COM
   - invoice_date: 2025-11-10
   - total_amount: 384.55
   - **pdf_url**: URL to the uploaded file
3. **Line Items** → Saved to `invoice_line_items` table:
   - GM1000912V - $143.00
   - GM1241366V - $88.00
   - GM2503350V - $115.00
4. **Inventory** → Auto-updated with smart deduplication

## Files
- **SQL Migration**: `add-pdf-url-column.sql`
- **This Guide**: `ADD-PDF-URL-COLUMN-INSTRUCTIONS.md`
