-- ============================================================================
-- FIX ALL MISSING COLUMNS FOR INVOICE SYSTEM
-- ============================================================================

-- 1. Add pdf_url column to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

COMMENT ON COLUMN public.invoices.pdf_url IS 'URL of the uploaded invoice file stored in Supabase Storage';

-- 2. Add description column to invoice_line_items table
ALTER TABLE public.invoice_line_items
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.invoice_line_items.description IS 'Part description/name from the invoice';

-- 3. Add updated_at column to inventory table
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

COMMENT ON COLUMN public.inventory.updated_at IS 'Timestamp of last update to inventory record';

-- 4. Create trigger to auto-update updated_at column on inventory changes
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

-- ============================================================================
-- VERIFICATION QUERIES (run these to confirm columns exist)
-- ============================================================================

-- Check invoices table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'invoices'
  AND column_name IN ('pdf_url');

-- Check invoice_line_items table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'invoice_line_items'
  AND column_name IN ('description');

-- Check inventory table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'inventory'
  AND column_name IN ('updated_at');
