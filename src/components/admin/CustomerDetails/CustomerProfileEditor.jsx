import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient.js'; // Adjust path as needed

export default function CustomerProfileEditor({ customer, customerId, onUpdate, message }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onUpdate(formData); // Pass the updated data to the parent handler
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Profile</button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
