import { supabase } from './supabaseClient';

export async function uploadRepairPhoto(workOrderId, file) {
  const filePath = `${workOrderId}/${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('repair-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data.path;
}
