-- Add pdf_url column to invoices table for storing uploaded invoice file URLs
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.invoices.pdf_url IS 'URL of the uploaded invoice file (PDF, image, etc.) stored in Supabase Storage';
