# Fix All Missing Columns - Quick Guide

## Errors Found
```
1. invoices: Missing 'pdf_url' column
2. invoice_line_items: Missing 'description' column
3. inventory: Missing 'updated_at' column
```

## Quick Fix - Run This SQL

Go to Supabase SQL Editor and run this:

```sql
-- 1. Add pdf_url to invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- 2. Add description to invoice_line_items
ALTER TABLE public.invoice_line_items
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Add updated_at to inventory
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create auto-update trigger for inventory.updated_at
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_inventory_updated_at ON public.inventory;

CREATE TRIGGER set_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();
```

## Steps
1. Go to https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql/new
2. Paste the SQL above
3. Click **Run** (or Ctrl+Enter)
4. Should see: `Success. No rows returned`

## After Running SQL
1. Go to https://c-a-r-s.vercel.app/admin/invoices
2. Hard refresh: **Ctrl + Shift + R**
3. Upload invoice again
4. Should now save completely!

## What Gets Saved
✅ **Invoice**: W4534112, HOUSTONAUTOPARTS.COM, $384.55, PDF URL
✅ **Line Items**: 3 parts with part numbers, descriptions, quantities, prices
✅ **Inventory**: Auto-updated with smart supplier deduplication

## Files
- **SQL**: `fix-all-missing-columns.sql`
- **Guide**: `FIX-ALL-MISSING-COLUMNS.md`
