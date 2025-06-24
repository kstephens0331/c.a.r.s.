import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient.js'; // Adjust path as needed

export default function AdminWorkOrderManager({ workOrder, customerId, onAddPart, onUploadDocument, message, setMessage }) {
  // Parts Management States
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [addingPart, setAddingPart] = useState(false);
  const [currentWorkOrderParts, setCurrentWorkOrderParts] = useState([]);

  // Document Upload States
  const [documentFile, setDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('quote');
  const [documentUploading, setDocumentUploading] = useState(false);
  const [currentWorkOrderDocuments, setCurrentWorkOrderDocuments] = useState([]);

  // Fetch available parts and current WO parts/documents on workOrder change
  useEffect(() => {
    const fetchData = async () => {
      if (!workOrder?.id) return;

      // Fetch all available inventory parts
      const { data: partsData, error: partsError } = await supabase
        .from('inventory')
        .select('*')
        .order('part_number', { ascending: true });

      if (partsError) {
        console.error('Error fetching available inventory parts:', partsError.message);
        return;
      }
      setAvailableParts(partsData);

      // Fetch parts already linked to this work order
      const { data: woPartsData, error: woPartsError } = await supabase
        .from('work_order_parts')
        .select(`
          id, part_number, description, quantity_used, unit_price_at_time,
          inventory (part_number, description)
        `)
        .eq('work_order_id', workOrder.id);

      if (woPartsError) {
        console.error('Error fetching work order parts:', woPartsError.message);
        return;
      }
      setCurrentWorkOrderParts(woPartsData);

      // Fetch documents for this work order
      const { data: docsData, error: docsError } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('work_order_id', workOrder.id);

      if (docsError) {
        console.error('Error fetching documents for work order:', docsError.message);
        return;
      }
      setCurrentWorkOrderDocuments(docsData);
    };

    fetchData();
  }, [workOrder]); // Re-fetch when workOrder prop changes

  const handleAddPartSubmit = async (e) => {
    e.preventDefault();
    // This handler will pass its own state (selectedPartId, partQuantity, etc.) to the parent handler
    onAddPart(workOrder.id, selectedPartId, partQuantity, availableParts, setMessage, setAddingPart, setSelectedPartId, setPartQuantity);
  };

  const handleDocumentUploadSubmit = async (e) => {
    e.preventDefault();
    // This handler will pass its own state (documentFile, documentType, etc.) to the parent handler
    onUploadDocument(workOrder.id, customerId, documentFile, documentType, setMessage, setDocumentUploading, setDocumentFile, setDocumentType);
  };

  return (
    <div className="mt-4 p-4 border-t border-gray-200 bg-white rounded-lg shadow-inner space-y-4">
      <h4 className="text-lg font-semibold mb-3">Work Order #{workOrder.work_order_number} Details:</h4>
      <p className="text-sm">Status: {workOrder.current_status}</p>
      <p className="text-sm">Description: {workOrder.description}</p>
      {message && <p className="text-sm mt-2">{message}</p>}

      {/* Add Parts Section */}
      <div>
        <h6 className="font-semibold mb-2">Add Parts to WO #{workOrder.work_order_number}:</h6>
        <form onSubmit={handleAddPartSubmit} className="space-y-2">
          <select
            className="w-full p-2 border rounded"
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            required
            disabled={addingPart}
          >
            <option value="">Select Part from Inventory</option>
            {availableParts.map(part => (
              <option key={part.id} value={part.id} disabled={part.quantity <= 0}>
                {part.part_number} - {part.description} (Avail: {part.quantity})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantity"
            className="w-full p-2 border rounded"
            value={partQuantity}
            onChange={(e) => setPartQuantity(parseInt(e.target.value) || 1)}
            min="1"
            required
            disabled={addingPart}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={addingPart}>
            {addingPart ? 'Adding...' : 'Add Part'}
          </button>
        </form>
        {currentWorkOrderParts.length > 0 && (
          <div className="mt-3">
            <h6 className="text-sm font-medium mb-1">Parts Used:</h6>
            <ul className="list-disc list-inside text-xs">
              {currentWorkOrderParts.map(part => (
                <li key={part.id}>{part.quantity_used} x {part.inventory?.part_number || part.part_number}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Upload Documents Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h6 className="font-semibold mb-2">Upload Documents:</h6>
        <form onSubmit={handleDocumentUploadSubmit} className="space-y-2">
          <input type="file" accept="application/pdf,image/*" onChange={(e) => setDocumentFile(e.target.files[0])} required className="block w-full text-sm text-gray-500" disabled={documentUploading} />
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} required className="w-full p-2 border rounded" disabled={documentUploading}>
            <option value="quote">Quote</option>
            <option value="paid_invoice">Paid Invoice</option>
          </select>
          <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600" disabled={documentUploading}>
            {documentUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
        {currentWorkOrderDocuments.length > 0 && (
          <div className="mt-3">
            <h6 className="text-sm font-medium mb-1">Uploaded Docs:</h6>
            <ul className="list-disc list-inside text-xs">
              {currentWorkOrderDocuments.map(doc => (
                <li key={doc.id}><a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{doc.file_name || doc.document_type}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}