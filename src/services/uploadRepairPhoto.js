import { supabase } from './supabaseClient';

export async function uploadRepairPhoto(workOrderId, file) {
  try {
    // Get the customer ID from the work order
    const { data: woData, error: woError } = await supabase
      .from('work_orders')
      .select('customer_id')
      .eq('id', workOrderId)
      .single();

    if (woError) throw new Error(`Failed to get customer ID: ${woError.message}`);
    const customerId = woData.customer_id;

    // Build the file path for the shared customer_documents bucket
    const ext = file.name?.split('.').pop() || 'jpg';
    const filePath = `customer_documents/${workOrderId}/repair_photo_${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customer-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('customer-files')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL');

    // Insert into shared documents table
    const { error: insertError } = await supabase
      .from('customer_documents')
      .insert({
        work_order_id: workOrderId,
        customer_id: customerId,
        document_type: 'repair_photo',
        document_url: publicUrlData.publicUrl,
        file_name: file.name,
        uploaded_by: 'admin'
      });

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('uploadRepairPhoto error:', err);
    throw err;
  }
}