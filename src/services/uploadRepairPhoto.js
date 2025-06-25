import { supabase } from './supabaseClient';

export async function uploadRepairPhoto(workOrderId, file) {
  try {
    // Step 1: Get customer ID from the work order
    const { data: woData, error: woError } = await supabase
      .from('work_orders')
      .select('customer_id')
      .eq('id', workOrderId)
      .single();

    if (woError) throw new Error(`Failed to get customer ID: ${woError.message}`);
    const customerId = woData.customer_id;

    // Step 2: Upload the file to Supabase storage
const filePath = `work_orders/${workOrderId}/${Date.now()}_${file.name}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('repair-photos')  // ✅ bucket matches use-case
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Step 3: Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('repair-photos')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL.');

    // Step 4: Insert into the repair_photos table
    const { error: insertError } = await supabase
      .from('repair_photos')
      .insert({
        work_order_id: workOrderId,
        customer_id: customerId,
        photo_url: publicUrlData.publicUrl,
        file_name: file.name,
        uploaded_by: 'admin',
      });

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    // Return public URL path for confirmation
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('uploadRepairPhoto error:', err);
    throw err;
  }
}