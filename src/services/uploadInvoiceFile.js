const filePath = `customer_documents/${workOrderId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('customer-files')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

const { data: publicUrlData } = supabase.storage
  .from('customer-files')
  .getPublicUrl(filePath);

if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL');

await supabase
  .from('customer_documents')
  .insert({
    work_order_id: workOrderId,
    customer_id: customerId,
    document_type: documentType, // 'repair_photo', 'quote', or 'paid_invoice'
    document_url: publicUrlData.publicUrl,
    file_name: file.name,
    uploaded_by: 'admin'
  });
