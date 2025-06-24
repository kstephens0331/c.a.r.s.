import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { uploadRepairPhoto } from '../../services/uploadRepairPhoto';

export default function UploadRepairPhoto() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [customers, setCustomers] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      if (!error) setCustomers(data);
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      if (!selectedCustomer) return;
      const { data, error } = await supabase
        .from('work_orders')
        .select('id, work_order_number')
        .eq('customer_id', selectedCustomer)
        .order('created_at', { ascending: false });
      if (!error) setWorkOrders(data);
    };
    fetchWorkOrders();
  }, [selectedCustomer]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedWorkOrder) return;

    setUploading(true);
    setMessage('');
    try {
      const path = await uploadRepairPhoto(selectedWorkOrder, file);
      setMessage(`File uploaded: ${path}`);
    } catch (err) {
      console.error(err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Upload Repair Photos</h2>

      <label className="block text-sm font-medium mb-1">Select Customer</label>
      <select
        value={selectedCustomer}
        onChange={(e) => {
          setSelectedCustomer(e.target.value);
          setSelectedWorkOrder('');
        }}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="">-- Choose Customer --</option>
        {customers.map((cust) => (
          <option key={cust.id} value={cust.id}>
            {cust.name}
          </option>
        ))}
      </select>

      {selectedCustomer && (
        <>
          <label className="block text-sm font-medium mb-1">Select Work Order</label>
          <select
            value={selectedWorkOrder}
            onChange={(e) => setSelectedWorkOrder(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="">-- Choose Work Order --</option>
            {workOrders.map((wo) => (
              <option key={wo.id} value={wo.id}>
                #{wo.work_order_number}
              </option>
            ))}
          </select>
        </>
      )}

      {selectedWorkOrder && (
        <>
          <label className="block text-sm font-medium mb-1">Photo File</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full p-2 border rounded"
            disabled={uploading}
          />
        </>
      )}

      {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
    </div>
  );
}