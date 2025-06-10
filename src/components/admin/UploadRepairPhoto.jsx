import { useState } from 'react';
import { uploadRepairPhoto } from '../../services/uploadRepairPhoto';

export default function UploadRepairPhoto({ workOrderId }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !workOrderId) return;

    setUploading(true);
    setMessage('');
    try {
      const path = await uploadRepairPhoto(workOrderId, file);
      setMessage(`File uploaded: ${path}`);
    } catch (err) {
      console.error(err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="my-4">
      <label className="block text-sm font-medium mb-1">Upload Repair Photo</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="block w-full p-2 border rounded"
        disabled={uploading}
      />
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
