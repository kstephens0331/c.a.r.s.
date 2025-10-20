import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient'; // Changed: removed .js extension

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('invoices')
          .select('*')
          .order('invoice_date', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }
        setInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(`Failed to load invoices: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

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
        await processImageWithAI(base64Data);
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

  const processImageWithAI = async (base64ImageData) => {
    const prompt = `Extract the following information from this invoice image as a JSON object:
    {
        "invoice_number": "string",
        "supplier": "string",
        "invoice_date": "YYYY-MM-DD string",
        "total_amount": "number",
        "line_items": [
            {
                "part_number": "string",
                "description": "string",
                "quantity": "number",
                "unit_price": "number"
            }
        ]
    }
    If a field is not found, use null or an empty string for strings, 0 for numbers, or an empty array for line_items.`;

    try {
        let chatHistory = [];
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/png", // Or image/jpeg based on actual image type
                                data: base64ImageData
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { // Define a schema to ensure consistent output format
                    type: "OBJECT",
                    properties: {
                        "invoice_number": { "type": "STRING" },
                        "supplier": { "type": "STRING" },
                        "invoice_date": { "type": "STRING", "format": "date" }, // EnsureYYYY-MM-DD
                        "total_amount": { "type": "NUMBER" },
                        "line_items": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "part_number": { "type": "STRING" },
                                    "description": { "type": "STRING" },
                                    "quantity": { "type": "NUMBER" },
                                    "unit_price": { "type": "NUMBER" }
                                }
                            }
                        }
                    }
                }
            }
        };

        const apiKey = "AIzaSyDFHVnXhRk6xyM4dzaCLe2sBOpfbrx0rE4";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonString = result.candidates[0].content.parts[0].text;
            let parsedJson;
            try {
                parsedJson = JSON.parse(jsonString);
                setAiMessage('Data extracted successfully!');
            } catch (parseError) {
                setAiMessage('AI returned invalid JSON. Please check the image quality.');
                console.error('AI parsing error:', parseError);
                return;
            }

            // Populate form fields with extracted data
            setInvoiceNumber(parsedJson.invoice_number || '');
            setSupplier(parsedJson.supplier || '');
            setInvoiceDate(parsedJson.invoice_date || ''); // AssumingYYYY-MM-DD
            setTotalAmount(parsedJson.total_amount ? parsedJson.total_amount.toString() : '');
            setExtractedLineItems(parsedJson.line_items || []);

        } else {
            setAiMessage('AI could not extract sufficient data. Please ensure the image is clear or enter details manually.');
            console.error('AI response structure unexpected:', result);
        }
    } catch (apiError) {
        setAiMessage(`AI processing failed: ${apiError.message}. Check your API key or network.`);
        console.error('Gemini API call error:', apiError);
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
            part_number: item.part_number,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
          });

        if (lineItemError) {
          console.error(`Error inserting line item ${item.part_number}:`, lineItemError.message);
          // Decide how to handle this: continue or rollback? For now, just log and continue.
        }

        // Update inventory: Check if part exists, then update quantity
        const { data: existingPart, error: partFetchError } = await supabase
          .from('inventory')
          .select('id, quantity')
          .eq('part_number', item.part_number)
          .single();

        if (partFetchError && partFetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
          console.error(`Error fetching existing part ${item.part_number}:`, partFetchError.message);
          // Decide how to handle this
        } else if (existingPart) {
          // Update existing part quantity
          const { error: updateInventoryError } = await supabase
            .from('inventory')
            .update({ quantity: existingPart.quantity + item.quantity })
            .eq('id', existingPart.id);
          if (updateInventoryError) {
            console.error(`Error updating inventory for part ${item.part_number}:`, updateInventoryError.message);
          }
        } else {
          // Part does not exist in inventory, insert new item
          const { error: insertInventoryError } = await supabase
            .from('inventory')
            .insert({
              part_number: item.part_number,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price, // Use the unit price from the invoice
              supplier: supplier, // Track supplier for reordering and price verification
            });
          if (insertInventoryError) {
            console.error(`Error inserting new inventory item ${item.part_number}:`, insertInventoryError.message);
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
          <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">Upload Invoice File (Image or PDF):</label>
          <input
            type="file"
            id="pdfFile"
            accept="image/*,application/pdf" // Accept images and PDFs
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
                        <td className="p-2 border-b">{item.part_number || 'N/A'}</td>
                        <td className="p-2 border-b">{item.description || 'N/A'}</td>
                        <td className="p-2 border-b text-right">{item.quantity || 0}</td>
                        <td className="p-2 border-b text-right">${item.unit_price ? parseFloat(item.unit_price).toFixed(2) : '0.00'}</td>
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
            <table className="min-w-full border border-gray-300 mt-8">
              <thead className="bg-accent text-left">
                <tr>
                  <th className="p-3 border-b">Invoice #</th>
                  <th className="p-3 border-b">Supplier</th>
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Total</th>
                  <th className="p-3 border-b">File</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}