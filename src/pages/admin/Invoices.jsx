import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient'; // Changed: removed .js extension
import Pagination from '../../components/Pagination'; // Import pagination component

const ITEMS_PER_PAGE = 50; // Show 50 invoices per page

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form states for manual input and AI extraction
  const [file, setFile] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(''); // Added for total amount
  const [extractedLineItems, setExtractedLineItems] = useState([]); // To display extracted line items
  const [processingAi, setProcessingAi] = useState(false); // State for AI processing
  const [aiMessage, setAiMessage] = useState(''); // Messages from AI processing

  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit/Delete modal states
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  useEffect(() => {
    let isCancelled = false; // For cleanup

    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        // Calculate pagination range
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        // Fetch invoices with pagination and total count
        const { data, error: fetchError, count } = await supabase
          .from('invoices')
          .select('*', { count: 'exact' })
          .order('invoice_date', { ascending: false })
          .range(start, end);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Only update state if component is still mounted
        if (!isCancelled) {
          setInvoices(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching invoices:', err);
          setError(`Failed to load invoices: ${err.message}`);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchInvoices();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [currentPage]); // Re-fetch when page changes

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setAiMessage('');
    setInvoiceNumber('');
    setSupplier('');
    setInvoiceDate('');
    setTotalAmount('');
    setExtractedLineItems([]);

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setProcessingAi(true);
      setAiMessage('Processing image with AI... This might take a moment.');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1]; // Get base64 string
        await processImageWithAI(base64Data, selectedFile.type); // Pass MIME type
        setProcessingAi(false);
      };
      reader.onerror = () => {
        setAiMessage('Failed to read file.');
        setProcessingAi(false);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile && selectedFile.type === 'application/pdf') {
        setAiMessage('PDFs cannot be processed by AI directly. Please enter details manually or upload an image.');
    } else {
        setAiMessage('');
    }
  };

  const processImageWithAI = async (base64ImageData, mimeType) => {
    try {
        // Call the secure edge function instead of Gemini API directly
        const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-invoice-ai`;

        // Get current session token for authorization
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setAiMessage('You must be logged in to use AI processing.');
            return;
        }

        console.log('Calling AI edge function:', edgeFunctionUrl);
        console.log('Image size:', base64ImageData.length, 'characters');
        console.log('MIME type:', mimeType);

        const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                imageBase64: base64ImageData,
                mimeType: mimeType || 'image/jpeg'
            }),
            signal: AbortSignal.timeout(60000) // 60 second timeout
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Response body:', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            throw new Error(`Invalid response from AI service: ${responseText.substring(0, 200)}`);
        }

        if (!response.ok) {
            console.error('AI service error:', result);
            throw new Error(result.error || result.message || 'Failed to process invoice');
        }

        if (result.success && result.data) {
            const extractedData = result.data;
            setAiMessage('Data extracted successfully!');

            // Populate form fields with extracted data
            setInvoiceNumber(extractedData.invoiceNumber || '');
            setSupplier(extractedData.supplier || '');
            setInvoiceDate(extractedData.invoiceDate || '');
            setTotalAmount(extractedData.totalAmount ? extractedData.totalAmount.toString() : '');
            setExtractedLineItems(extractedData.lineItems || []);
        } else {
            setAiMessage('AI could not extract sufficient data. Please ensure the image is clear or enter details manually.');
        }
    } catch (apiError) {
        console.error('Edge function call error:', apiError);

        // Provide more specific error messages
        if (apiError.name === 'AbortError' || apiError.name === 'TimeoutError') {
            setAiMessage('AI processing timed out. The image may be too large or complex. Try a smaller/clearer image.');
        } else if (apiError.message.includes('Failed to fetch')) {
            setAiMessage('Network error: Could not reach AI service. Check your internet connection and try again.');
        } else {
            setAiMessage(`AI processing failed: ${apiError.message}`);
        }
    }
  };


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadMessage('');

    if (!file || !invoiceNumber || !supplier || !invoiceDate) {
      setUploadMessage('Please fill all required fields and select a file.');
      setUploading(false);
      return;
    }

    try {
      let publicUrl = null;
      if (file) {
        // Define the storage path for the file (image or PDF)
        const fileExtension = file.name.split('.').pop();
        const filePath = `invoices/${invoiceNumber}_${new Date().getTime()}.${fileExtension}`; // Unique filename

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invoice-files') // Use a generic bucket for all invoice files (images/pdfs)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false // Don't upsert if you want unique files
          });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('invoice-files')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
            throw new Error('Failed to get public URL for the uploaded file.');
        }
        publicUrl = publicUrlData.publicUrl;
      }

      // Insert main invoice record into the database
      const { data: invoiceRecord, error: insertError } = await supabase
        .from('invoices')
        .insert([
          {
            invoice_number: invoiceNumber,
            supplier: supplier,
            invoice_date: invoiceDate,
            pdf_url: publicUrl, // Store the URL of the uploaded file
            total_amount: totalAmount ? parseFloat(totalAmount) : null,
          }
        ])
        .select();

      if (insertError) {
        // If invoice record insertion fails, you might want to delete the uploaded file from storage
        if (publicUrl) {
             await supabase.storage.from('invoice-files').remove([publicUrl.split('invoice-files/')[1]]); // Extract path
        }
        throw new Error(`Error inserting invoice record: ${insertError.message}`);
      }

      const newInvoiceId = invoiceRecord[0].id;

      // Insert line items into invoice_line_items table and update inventory
      for (const item of extractedLineItems) {
        // Insert line item
        const { error: lineItemError } = await supabase
          .from('invoice_line_items')
          .insert({
            invoice_id: newInvoiceId,
            part_number: item.partNumber || item.part_number,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice || item.unit_price,
          });

        if (lineItemError) {
          console.error(`Error inserting line item ${item.partNumber || item.part_number}:`, lineItemError.message);
          // Decide how to handle this: continue or rollback? For now, just log and continue.
        }

        // ========================================================================
        // SMART INVENTORY UPDATE WITH SUPPLIER DEDUPLICATION
        // ========================================================================
        // Strategy:
        // 1. Check if part exists with SAME supplier → Update quantity only
        // 2. Check if part exists with DIFFERENT supplier → Create new record
        // 3. If part doesn't exist → Create new record
        // ========================================================================

        const partNumber = item.partNumber || item.part_number;
        const unitPrice = item.unitPrice || item.unit_price;

        // Check if part exists from this SAME supplier
        const { data: existingPartSameSupplier, error: sameSupplierError } = await supabase
          .from('inventory')
          .select('id, quantity, unit_price')
          .eq('part_number', partNumber)
          .eq('supplier', supplier)
          .maybeSingle();

        if (sameSupplierError) {
          console.error(`Error checking inventory for part ${partNumber}:`, sameSupplierError.message);
          continue; // Skip this item
        }

        if (existingPartSameSupplier) {
          // ✅ SAME PART + SAME SUPPLIER: Just add to quantity
          const newQuantity = existingPartSameSupplier.quantity + item.quantity;

          const { error: updateInventoryError } = await supabase
            .from('inventory')
            .update({
              quantity: newQuantity,
              unit_price: unitPrice, // Update price (supplier may have changed price)
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPartSameSupplier.id);

          if (updateInventoryError) {
            console.error(`Error updating inventory for part ${partNumber}:`, updateInventoryError.message);
          } else {
            console.log(`✅ Updated ${partNumber} from ${supplier}: ${existingPartSameSupplier.quantity} + ${item.quantity} = ${newQuantity}`);
          }
        } else {
          // Check if part exists from DIFFERENT supplier
          const { data: existingPartOtherSupplier, error: otherSupplierError } = await supabase
            .from('inventory')
            .select('id, supplier, unit_price')
            .eq('part_number', partNumber)
            .neq('supplier', supplier)
            .maybeSingle();

          if (otherSupplierError && otherSupplierError.code !== 'PGRST116') {
            console.error(`Error checking other suppliers for part ${partNumber}:`, otherSupplierError.message);
          }

          // ✅ SAME PART + DIFFERENT SUPPLIER: Create separate inventory record
          // This allows price comparison between suppliers
          const { error: insertInventoryError } = await supabase
            .from('inventory')
            .insert({
              part_number: partNumber,
              description: item.description,
              quantity: item.quantity,
              unit_price: unitPrice,
              supplier: supplier,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertInventoryError) {
            console.error(`Error inserting new inventory item ${partNumber}:`, insertInventoryError.message);
          } else {
            if (existingPartOtherSupplier) {
              console.log(`✅ Added ${partNumber} from NEW supplier ${supplier} (was: ${existingPartOtherSupplier.supplier} @ $${existingPartOtherSupplier.unit_price}, now: ${supplier} @ $${unitPrice})`);
            } else {
              console.log(`✅ Created new inventory record: ${partNumber} from ${supplier}`);
            }
          }
        }
      }


      setUploadMessage('Invoice uploaded and recorded successfully! Inventory updated.');
      // Refresh the list of invoices
      setInvoices((prev) => [invoiceRecord[0], ...prev]);

      // Clear form states
      setFile(null);
      setInvoiceNumber('');
      setSupplier('');
      setInvoiceDate('');
      setTotalAmount('');
      setExtractedLineItems([]);
      setAiMessage('');
      e.target.reset(); // Reset file input element

    } catch (err) {
      console.error('Invoice submission error:', err);
      setUploadMessage(`Submission failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle Edit Invoice
  const handleEditInvoice = (invoice) => {
    setEditingInvoice({...invoice});
    setShowEditModal(true);
  };

  // Handle Save Edited Invoice
  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          invoice_number: editingInvoice.invoice_number,
          supplier: editingInvoice.supplier,
          invoice_date: editingInvoice.invoice_date,
          total_amount: parseFloat(editingInvoice.total_amount)
        })
        .eq('id', editingInvoice.id);

      if (error) throw error;

      // Update local state
      setInvoices(prev => prev.map(inv =>
        inv.id === editingInvoice.id ? editingInvoice : inv
      ));

      setShowEditModal(false);
      setEditingInvoice(null);
      alert('Invoice updated successfully!');
    } catch (err) {
      console.error('Error updating invoice:', err);
      alert(`Failed to update invoice: ${err.message}`);
    }
  };

  // Handle Delete Invoice
  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      // Delete associated line items first
      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoiceToDelete.id);

      if (lineItemsError) throw lineItemsError;

      // Delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete.id);

      if (invoiceError) throw invoiceError;

      // Delete file from storage if exists
      if (invoiceToDelete.pdf_url) {
        const filePath = invoiceToDelete.pdf_url.split('invoice-files/')[1];
        if (filePath) {
          await supabase.storage.from('invoice-files').remove([filePath]);
        }
      }

      // Update local state
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      setTotalCount(prev => prev - 1);

      setShowDeleteConfirm(false);
      setInvoiceToDelete(null);
      alert('Invoice deleted successfully!');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert(`Failed to delete invoice: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Invoices | Collision & Refinish Shop</title>
          <meta name="description" content="Upload and track invoices from parts vendors. Scanned line items will sync to inventory." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Invoices | Collision & Refinish Shop</title>
          <meta name="description" content="Upload and track invoices from parts vendors. Scanned line items will sync to inventory." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Invoices | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Upload and track invoices from parts vendors. Scanned line items will sync to inventory."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-lg">Upload vendor invoices and track incoming parts.</p>

        {/* Upload Form */}
        <form onSubmit={handleFormSubmit} className="bg-accent p-4 rounded shadow space-y-4 max-w-xl">
          <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">Upload Invoice File (PNG, JPG, or PDF):</label>
          <input
            type="file"
            id="pdfFile"
            accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" // Accept PNG, JPG, PDF only
            className="block w-full p-2 border rounded"
            onChange={handleFileChange}
            required
            disabled={uploading || processingAi}
          />
          {processingAi && <p className="text-sm text-blue-600">Processing image with AI...</p>}
          {aiMessage && <p className={`text-sm mt-2 ${aiMessage.includes('failed') || aiMessage.includes('invalid') ? 'text-red-500' : 'text-green-500'}`}>{aiMessage}</p>}


          <label htmlFor="invoiceNum" className="block text-sm font-medium text-gray-700">Invoice Number:</label>
          <input
            type="text"
            id="invoiceNum"
            className="w-full p-2 border rounded"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
            disabled={uploading || processingAi}
          />
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier:</label>
          <input
            type="text"
            id="supplier"
            className="w-full p-2 border rounded"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
            disabled={uploading || processingAi}
          />
          <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">Invoice Date:</label>
          <input
            type="date"
            id="invoiceDate"
            className="w-full p-2 border rounded"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            required
            disabled={uploading || processingAi}
          />
          <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">Total Amount:</label>
          <input
            type="number" // Use type number for amounts
            step="0.01"
            id="totalAmount"
            className="w-full p-2 border rounded"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            disabled={uploading || processingAi}
          />

          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-black"
            disabled={uploading || processingAi}
          >
            {uploading ? 'Submitting...' : 'Save Invoice'}
          </button>
          {uploadMessage && <p className={`text-sm mt-2 ${uploadMessage.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>{uploadMessage}</p>}

          {/* Display Extracted Line Items (read-only for now) */}
          {extractedLineItems.length > 0 && (
            <div className="mt-6 border-t border-gray-300 pt-4">
              <h3 className="text-md font-semibold mb-2">Extracted Line Items (Review before saving)</h3>
              <div className="overflow-x-auto text-sm">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border-b text-left">Part #</th>
                      <th className="p-2 border-b text-left">Description</th>
                      <th className="p-2 border-b text-right">Qty</th>
                      <th className="p-2 border-b text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedLineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2 border-b">{item.partNumber || item.part_number || 'N/A'}</td>
                        <td className="p-2 border-b">{item.description || 'N/A'}</td>
                        <td className="p-2 border-b text-right">{item.quantity || 0}</td>
                        <td className="p-2 border-b text-right">${item.unitPrice ? parseFloat(item.unitPrice).toFixed(2) : (item.unit_price ? parseFloat(item.unit_price).toFixed(2) : '0.00')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>

        {/* Invoice table */}
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <p className="text-gray-500 mt-8">No invoices found.</p>
          ) : (
            <>
              <table className="min-w-full border border-gray-300 mt-8">
                <thead className="bg-accent text-left">
                  <tr>
                    <th className="p-3 border-b">Invoice #</th>
                    <th className="p-3 border-b">Supplier</th>
                    <th className="p-3 border-b">Date</th>
                    <th className="p-3 border-b">Total</th>
                    <th className="p-3 border-b">File</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{invoice.invoice_number}</td>
                      <td className="p-3 border-b">{invoice.supplier}</td>
                      <td className="p-3 border-b">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                      <td className="p-3 border-b">${invoice.total_amount ? parseFloat(invoice.total_amount).toFixed(2) : '0.00'}</td>
                      <td className="p-3 border-b">
                        {invoice.pdf_url ? (
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="text-brandRed hover:underline">
                            View File
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="p-3 border-b">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice)}
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        {/* Edit Invoice Modal */}
        {showEditModal && editingInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Invoice</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={editingInvoice.invoice_number || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, invoice_number: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier</label>
                  <input
                    type="text"
                    value={editingInvoice.supplier || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, supplier: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={editingInvoice.invoice_date || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, invoice_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.total_amount || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, total_amount: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {setShowEditModal(false); setEditingInvoice(null);}}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && invoiceToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Confirm Delete</h2>
              <p className="mb-4">
                Are you sure you want to delete invoice <strong>{invoiceToDelete.invoice_number}</strong> from <strong>{invoiceToDelete.supplier}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This will also delete all associated line items. This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 font-semibold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {setShowDeleteConfirm(false); setInvoiceToDelete(null);}}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}