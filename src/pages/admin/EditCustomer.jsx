import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient';

export default function EditCustomer() {
  const { id } = useParams(); // customer ID
  const navigate = useNavigate();

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

  useEffect(() => {
    const loadData = async () => {
      const { data: customer, error: cErr } = await supabase.from('customers').select('*').eq('id', id).single();
      const { data: vehicle, error: vErr } = await supabase.from('vehicles').select('*').eq('customer_id', id).single();

      if (cErr || vErr) return setMessage('Error loading customer/vehicle.');

      setForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        color: vehicle.color || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || ''
      });
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    const { error: cErr } = await supabase.from('customers').update({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address
    }).eq('user_id', user.id);

    const { error: vErr } = await supabase.from('vehicles').update({
      make: form.make,
      model: form.model,
      year: parseInt(form.year),
      color: form.color,
      vin: form.vin,
      license_plate: form.license_plate
    }).eq('customer_id', id);

    if (cErr || vErr) {
      setMessage('Error updating records.');
    } else {
      setMessage('Customer updated.');
      setTimeout(() => navigate('/admin/customers'), 1000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Customer | Collision & Refinish Shop</title>
        <meta name="description" content="Update customer and vehicle information." />
      </Helmet>

      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Edit Customer</h1>

        <form onSubmit={handleUpdate} className="space-y-4 bg-accent p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Customer Info</h2>
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" />

          <h2 className="text-xl font-semibold mt-6">Vehicle Info</h2>
          <input name="make" placeholder="Make" value={form.make} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="model" placeholder="Model" value={form.model} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="color" placeholder="Color" value={form.color} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="vin" placeholder="Full VIN" value={form.vin} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="license_plate" placeholder="License Plate" value={form.license_plate} onChange={handleChange} className="w-full border p-2 rounded" />

          <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-black">
            Save Changes
          </button>
        </form>

        {message && <p className="text-sm text-center mt-2 text-green-600">{message}</p>}
      </div>
    </>
  );
}
