import { Helmet } from 'react-helmet-async';
import { useState } from 'react';

export default function PhotoUploads() {
  const [file, setFile] = useState(null);
  const [workOrderId, setWorkOrderId] = useState('');
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !workOrderId) {
      setMessage('Please select a file and enter a work order ID.');
      return;
    }

    // Placeholder upload logic
    setMessage(`File "${file.name}" assigned to Work Order #${workOrderId}.`);
    setFile(null);
    setWorkOrderId('');
  };

  return (
    <>
      <Helmet>
        <title>Upload Repair Photos | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Upload repair images and assign them to customer work orders for customer portal viewing."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Upload Repair Photos</h1>
        <p className="text-lg">Attach progress or final repair images to any work order.</p>

        <form onSubmit={handleUpload} className="bg-accent p-6 rounded shadow max-w-xl space-y-4">
          <label className="block font-medium">Work Order ID</label>
          <input
            type="text"
            value={workOrderId}
            onChange={(e) => setWorkOrderId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. 2047"
            required
          />

          <label className="block font-medium">Photo File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded"
            required
          />

          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-black"
          >
            Upload Photo
          </button>

          {message && <p className="text-green-600 mt-2 text-sm">{message}</p>}
        </form>
      </div>
    </>
  );
}
