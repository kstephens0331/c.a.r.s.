-- ============================================================================
-- Add supplier column to invoices table
-- ============================================================================
-- This column is required by the code in Invoices.jsx line 293
-- It stores the vendor/supplier name from AI-extracted invoice data
-- ============================================================================

-- Add supplier column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices'
    AND column_name = 'supplier'
  ) THEN
    ALTER TABLE invoices ADD COLUMN supplier TEXT;

    -- Add index for faster supplier searches
    CREATE INDEX idx_invoices_supplier ON invoices(supplier);

    -- Add comment
    COMMENT ON COLUMN invoices.supplier IS 'Vendor/supplier name extracted from invoice';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'invoices';
-- ============================================================================
