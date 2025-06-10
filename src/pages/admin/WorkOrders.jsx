import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // Ensure this path is correct

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [workOrderParts, setWorkOrderParts] = useState([]); // Parts currently associated with the selected work order

  // Document upload states
  const [documentFile, setDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('quote'); // 'quote' or 'paid_invoice'
  const [documentUploadMessage, setDocumentUploadMessage] = useState('');
  const [documentUploading, setDocumentUploading] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState([]); // Documents for selected work order

  const statuses = [
    'Estimate Scheduled',
    'Parts Ordered',
    'Parts Received',
    'Repairs Started',
    'Paint',
    'Quality Check',
    'Complete',
    'Ready for Pickup'
  ];

  // Fetch work orders on component mount
  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('work_orders')
        .select(`
          id,
          created_at,
          work_order_number,
          current_status,
          description,
          vehicle_id,
          vehicles (
            make,
            model,
            year,
            customer_id,
            profiles (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching work orders:', fetchError.message);
        setError(`Failed to load work orders: ${fetchError.message}`);
      } else {
        setWorkOrders(data);
      }
      setLoading(false);
    };

    fetchWorkOrders();
  }, []);

  // Fetch available parts and work order specific parts/documents when a work order is selected
  useEffect(() => {
    const fetchDetailsForSelectedWorkOrder = async () => {
      if (!selectedWorkOrderId) {
        setAvailableParts([]);
        setWorkOrderParts([]);
        setCustomerDocuments([]);
        return;
      }

      // Fetch all available inventory parts
      const { data: partsData, error: partsError } = await supabase
        .from('inventory')
        .select('*')
        .order('part_number', { ascending: true });

      if (partsError) {
        console.error('Error fetching available parts:', partsError.message);
        setError(`Failed to load available parts: ${partsError.message}`);
        return;
      }
      setAvailableParts(partsData);

      // Fetch parts already linked to this work order
      const { data: woPartsData, error: woPartsError } = await supabase
        .from('work_order_parts')
        .select(`
          *,
          inventory (
            part_number,
            description
          )
        `)
        .eq('work_order_id', selectedWorkOrderId);

      if (woPartsError) {
        console.error('Error fetching work order parts:', woPartsError.message);
        setError(`Failed to load work order parts: ${woPartsError.message}`);
        return;
      }
      setWorkOrderParts(woPartsData);

      // Fetch customer documents for this work order
      const { data: docsData, error: docsError } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('work_order_id', selectedWorkOrderId)
        .order('created_at', { ascending: false });

      if (docsError) {
        console.error('Error fetching customer documents:', docsError.message);
        setError(`Failed to load customer documents: ${docsError.message}`);
        return;
      }
      setCustomerDocuments(docsData);
    };

    fetchDetailsForSelectedWorkOrder();
  }, [selectedWorkOrderId]);


  const handleStatusChange = async (workOrderId, newStatus) => {
    setMessage('');
    try {
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({ current_status: newStatus, updated_at: new Date().toISOString() }) // Update updated_at
        .eq('id', workOrderId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setWorkOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === workOrderId ? { ...order, current_status: newStatus } : order
        )
      );
      setMessage(`Status for WO #${workOrders.find(o => o.id === workOrderId)?.work_order_number || workOrderId} updated successfully.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(`Failed to update status for WO #${workOrderId}: ${err.message}`);
    }
  };

  const handleAddPartToWorkOrder = async (e) => {
    e.preventDefault();
    if (!selectedWorkOrderId || !selectedPartId || partQuantity <= 0) {
      setMessage('Please select a work order, a part, and a valid quantity.');
      return;
    }

    const partToAdd = availableParts.find(p => p.id === selectedPartId);
    if (!partToAdd || partToAdd.quantity < partQuantity) {
      setMessage(`Not enough ${partToAdd?.description || 'parts'} in inventory. Available: ${partToAdd?.quantity || 0}`);
      return;
    }

    setMessage('');
    try {
      // 1. Add part to work_order_parts table
      const { error: addWoPartError } = await supabase
        .from('work_order_parts')
        .insert({
          work_order_id: selectedWorkOrderId,
          inventory_id: selectedPartId,
          part_number: partToAdd.part_number, // Store part_number and description for redundancy/simplicity
          description: partToAdd.description,
          quantity_used: partQuantity,
          unit_price_at_time: partToAdd.unit_price, // Record price at time of use
        });

      if (addWoPartError) {
        throw new Error(addWoPartError.message);
      }

      // 2. Decrement quantity in inventory
      const { error: updateInventoryError } = await supabase
        .from('inventory')
        .update({ quantity: partToAdd.quantity - partQuantity })
        .eq('id', selectedPartId);

      if (updateInventoryError) {
        // If inventory update fails, consider rolling back work_order_parts insertion
        // For simplicity, we'll just log the error here.
        throw new Error(`Failed to update inventory: ${updateInventoryError.message}`);
      }

      setMessage(`Added ${partQuantity} x ${partToAdd.description} to work order.`);
      // Refresh parts for selected work order
      setSelectedWorkOrderId(selectedWorkOrderId); // Re-trigger useEffect for details
      setSelectedPartId('');
      setPartQuantity(1);
    } catch (err) {
      console.error('Error adding part to work order:', err);
      setMessage(`Error adding part: ${err.message}`);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setDocumentUploading(true);
    setDocumentUploadMessage('');

    if (!selectedWorkOrderId || !documentFile || !documentType) {
      setDocumentUploadMessage('Please select a work order, a file, and a document type.');
      setDocumentUploading(false);
      return;
    }

    try {
      const selectedWorkOrder = workOrders.find(wo => wo.id === selectedWorkOrderId);
      const customerId = selectedWorkOrder?.vehicles?.customer_id;
      if (!customerId) {
        throw new Error('Could not determine customer for selected work order.');
      }

      const fileExtension = documentFile.name.split('.').pop();
      const filePath = `customer_documents/${selectedWorkOrderId}/${documentType}_${new Date().getTime()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer-files') // Use a bucket for customer-specific documents
        .upload(filePath, documentFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('customer-files')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
          throw new Error('Failed to get public URL for the uploaded file.');
      }

      const { error: insertDocError } = await supabase
        .from('customer_documents')
        .insert({
          work_order_id: selectedWorkOrderId,
          customer_id: customerId,
          document_type: documentType,
          document_url: publicUrlData.publicUrl,
          file_name: documentFile.name,
        });

      if (insertDocError) {
        await supabase.storage.from('customer-files').remove([filePath]); // Clean up uploaded file
        throw new Error(`Error saving document record: ${insertDocError.message}`);
      }

      setDocumentUploadMessage('Document uploaded successfully for customer!');
      setDocumentFile(null);
      // Refresh documents for selected work order
      setSelectedWorkOrderId(selectedWorkOrderId); // Re-trigger useEffect
      e.target.reset(); // Reset file input
    } catch (err) {
      console.error('Error uploading document:', err);
      setDocumentUploadMessage(`Error uploading document: ${err.message}`);
    } finally {
      setDocumentUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Work Orders | Collision & Refinish Shop</title>
          <meta name="description" content="Manage repair status for each active vehicle. Update progress and notify customers in real-time." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p>Loading work orders...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Work Orders | Collision & Refinish Shop</title>
          <meta name="description" content="Manage repair status for each active vehicle. Update progress and notify customers in real-time." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Work Orders | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Manage repair status and track all active jobs in the shop."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <p className="text-lg">Update repair status and track all active jobs in the shop.</p>

        {message && (
          <p className={`text-center mt-4 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        {workOrders.length === 0 ? (
          <p className="text-gray-500">No active work orders found.</p>
        ) : (
          <div className="space-y-4">
            {workOrders.map((order) => (
              <div key={order.id} className="border p-4 rounded shadow">
                <h2 className="text-xl font-semibold">
                  Work Order #{order.work_order_number} – {order.vehicles?.year} {order.vehicles?.make} {order.vehicles?.model}
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  Customer: {order.vehicles?.profiles?.full_name || 'N/A'}
                </p>

                <label htmlFor={`status-${order.id}`} className="block mb-2 font-medium">
                  Current Status
                </label>
                <select
                  id={`status-${order.id}`}
                  className="border rounded px-3 py-2 w-full md:w-1/2"
                  value={order.current_status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {/* --- Add Parts Section --- */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Parts for Work Order</h3>
                  {selectedWorkOrderId === order.id && (
                    <form onSubmit={handleAddPartToWorkOrder} className="space-y-3 mb-4">
                      <div className="flex flex-col md:flex-row gap-2">
                        <select
                          className="flex-1 border p-2 rounded"
                          value={selectedPartId}
                          onChange={(e) => setSelectedPartId(e.target.value)}
                          required
                        >
                          <option value="">Select a Part</option>
                          {availableParts.map(part => (
                            <option key={part.id} value={part.id} disabled={part.quantity <= 0}>
                              {part.part_number} - {part.description} (Qty: {part.quantity})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Qty"
                          className="w-20 border p-2 rounded"
                          value={partQuantity}
                          onChange={(e) => setPartQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                          required
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          Add Part
                        </button>
                      </div>
                    </form>
                  )}
                  <button
                    onClick={() => setSelectedWorkOrderId(selectedWorkOrderId === order.id ? null : order.id)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm"
                  >
                    {selectedWorkOrderId === order.id ? 'Hide Part Management' : 'Manage Parts'}
                  </button>

                  {workOrderParts.filter(p => p.work_order_id === order.id).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Parts Used in this WO:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {workOrderParts.filter(p => p.work_order_id === order.id).map((part, index) => (
                          <li key={index}>
                            {part.part_number} - {part.description} (Qty: {part.quantity_used})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* --- Customer Documents Upload Section --- */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Customer Documents</h3>
                  <form onSubmit={handleDocumentUpload} className="space-y-3">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setDocumentFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                      disabled={documentUploading}
                    />
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full border p-2 rounded"
                      required
                      disabled={documentUploading}
                    >
                      <option value="quote">Quote</option>
                      <option value="paid_invoice">Paid Invoice</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      disabled={documentUploading}
                    >
                      {documentUploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                    {documentUploadMessage && <p className={`text-sm mt-2 ${documentUploadMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{documentUploadMessage}</p>}
                  </form>

                  {customerDocuments.filter(doc => doc.work_order_id === order.id).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Uploaded Documents:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {customerDocuments.filter(doc => doc.work_order_id === order.id).map((doc, index) => (
                          <li key={index}>
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {doc.file_name || doc.document_type.toUpperCase()} ({doc.document_type})
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
