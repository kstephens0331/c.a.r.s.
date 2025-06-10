import { supabase } from './supabaseClient';

export async function uploadInvoiceFile(invoiceId, file) {
  const filePath = `${invoiceId}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('invoice-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data.path;
}