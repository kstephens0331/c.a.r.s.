-- Add supplier column to inventory table
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS supplier TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN inventory.supplier IS 'Supplier/vendor name for reordering and price verification';

-- Create index for faster searches by supplier
CREATE INDEX IF NOT EXISTS idx_inventory_supplier
ON inventory(supplier);
