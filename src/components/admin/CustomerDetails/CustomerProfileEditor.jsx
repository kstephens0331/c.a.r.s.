import { useState, useEffect } from 'react';

export default function CustomerProfileEditor({ customer, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street Address"
          className="w-full p-2 border rounded"
        />
      </div>
      <button type="submit" className="bg-brandRed text-white px-4 py-2 rounded hover:bg-red-600">
        Update Profile
      </button>
    </form>
  );
}
