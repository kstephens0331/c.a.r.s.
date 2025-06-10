import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient';

export default function AddCustomer() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vin: '',
    license_plate: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address
        }
      ])
      .select()
      .single();

    if (customerError) return setMessage(`Error: ${customerError.message}`);

    const { error: vehicleError } = await supabase.from('vehicles').insert([
      {
        customer_id: customerData.id,
        make: form.make,
        model: form.model,
        year: parseInt(form.year),
        color: form.color,
        vin: form.vin,
        license_plate: form.license_plate
      }
    ]);

    if (vehicleError) return setMessage(`Error: ${vehicleError.message}`);

    setMessage('Customer and vehicle added successfully.');
    setForm({
      name: '', email: '', phone: '', address: '',
      make: '', model: '', year: '', color: '', vin: '', license_plate: ''
    });
  };

  return (
    <>
      <Helmet>
        <title>Add Customer | Admin | Collision & Refinish Shop</title>
        <meta name="description" content="Create a new customer record and attach their vehicle." />
      </Helmet>

      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Add New Customer</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-accent p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Customer Info</h2>
          <input name="name" placeholder="Full Name" className="w-full border p-2 rounded" value={form.name} onChange={handleChange} required />
          <input name="email" placeholder="Email" className="w-full border p-2 rounded" value={form.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone" className="w-full border p-2 rounded" value={form.phone} onChange={handleChange} />
          <input name="address" placeholder="Address" className="w-full border p-2 rounded" value={form.address} onChange={handleChange} />

          <h2 className="text-xl font-semibold mt-6">Vehicle Info</h2>
          <input name="make" placeholder="Make" className="w-full border p-2 rounded" value={form.make} onChange={handleChange} />
          <input name="model" placeholder="Model" className="w-full border p-2 rounded" value={form.model} onChange={handleChange} />
          <input name="year" placeholder="Year" type="number" className="w-full border p-2 rounded" value={form.year} onChange={handleChange} />
          <input name="color" placeholder="Color" className="w-full border p-2 rounded" value={form.color} onChange={handleChange} />
          <input name="vin" placeholder="Full VIN" className="w-full border p-2 rounded" value={form.vin} onChange={handleChange} />
          <input name="license_plate" placeholder="License Plate" className="w-full border p-2 rounded" value={form.license_plate} onChange={handleChange} />

          <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-black">
            Add Customer
          </button>
        </form>

        {message && <p className="text-sm text-center mt-2 text-green-600">{message}</p>}
      </div>
    </>
  );
}
