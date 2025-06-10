import React, { useState } from 'react';

export default function AdminWorkOrderCreator({ vehicleItem, onCreateWorkOrder, message, creatingWorkOrder, onCancel }) {
  const [newWorkOrderForm, setNewWorkOrderForm] = useState({
    work_order_number: '', description: ''
  });

  const handleChange = (e) => {
    setNewWorkOrderForm({ ...newWorkOrderForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onCreateWorkOrder(vehicleItem.id, newWorkOrderForm); // Pass vehicleId and form data to parent
    setNewWorkOrderForm({ work_order_number: '', description: '' }); // Reset form
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
        <h4 className="text-lg font-semibold">Create New Work Order for {vehicleItem.make} {vehicleItem.model}</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" name="work_order_number" value={newWorkOrderForm.work_order_number} onChange={handleChange} placeholder="Work Order #" required className="w-full p-2 border rounded" />
            <textarea name="description" value={newWorkOrderForm.description} onChange={handleChange} placeholder="Description (e.g., Collision repair)" className="w-full p-2 border rounded h-20"></textarea>
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" disabled={creatingWorkOrder}>
                {creatingWorkOrder ? 'Creating...' : 'Create Work Order'}
            </button>
        </form>
        <button onClick={onCancel} className="mt-3 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
