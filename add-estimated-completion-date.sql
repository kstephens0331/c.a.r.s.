-- Add estimated_completion_date column to work_orders table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz/sql

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;

-- Add comment to column
COMMENT ON COLUMN work_orders.estimated_completion_date IS 'Estimated date when repair will be completed';

-- Optional: Add an index for faster queries on this column
CREATE INDEX IF NOT EXISTS idx_work_orders_est_completion
ON work_orders(estimated_completion_date);
