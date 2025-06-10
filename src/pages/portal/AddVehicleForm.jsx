import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js'; // Corrected: Explicitly added .js extension

export default function AddVehicleForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    vin: '',
    license_plate: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // To store the logged-in user's ID

  useEffect(() => {
    // Fetch the current user's session to get their ID
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        // If no session, redirect to login page.
        // This is a fallback as CustomerPortalLayout should already protect this route.
        navigate('/login');
      } else {
        setUserId(session.user.id);
      }
    };
    getSession();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!userId) {
      setMessage('Error: User not logged in.');
      setLoading(false);
      return;
    }

    try {
      // Insert the new vehicle into the 'vehicles' table
      const { data, error } = await supabase
        .from('vehicles')
        .insert([
          {
            customer_id: userId, // Link vehicle to the logged-in user
            make: form.make,
            model: form.model,
            year: parseInt(form.year), // Ensure year is an integer
            color: form.color,
            vin: form.vin,
            license_plate: form.license_plate
          }
        ])
        .select(); // Select the inserted data to confirm

      if (error) {
        if (error.code === '23505' && error.details.includes('vin')) {
          setMessage('Error: A vehicle with this VIN already exists.');
        } else {
          setMessage(`Error adding vehicle: ${error.message}`);
        }
        console.error('Error adding vehicle:', error);
      } else {
        setMessage('Vehicle added successfully!');
        // Clear the form
        setForm({
          make: '',
          model: '',
          year: '',
          color: '',
          vin: '',
          license_plate: ''
        });
        // Optionally navigate back to MyVehicles after successful add
        setTimeout(() => navigate('/portal/my-vehicles'), 1500);
      }
    } catch (err) {
      setMessage('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add New Vehicle | Customer Portal</title>
        <meta name="description" content="Add a new vehicle to your customer account." />
      </Helmet>

      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-primary">Add New Vehicle</h1>
        <p className="text-lg text-gray-700">Enter details for a new vehicle to add to your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-accent p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-primary">Vehicle Details</h2>
          <input
            name="make"
            placeholder="Make (e.g., Toyota)"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brandRed focus:border-transparent"
            value={form.make}
            onChange={handleChange}
            required
          />
          <input
            name="model"
            placeholder="Model (e.g., Camry)"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brandRed focus:border-transparent"
            value={form.model}
            onChange={handleChange}
            required
          />
          <input
            name="year"
            type="number"
            placeholder="Year (e.g., 2020)"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brandRed focus:border-transparent"
            value={form.year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
          <input
            name="color"
            placeholder="Color (e.g., Blue)"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brandRed focus:border-transparent"
            value={form.color}
            onChange={handleChange}
          />
          <input
            name="vin"
            placeholder="Full VIN (Vehicle Identification Number)"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brandRed focus:border-transparent"
            value={form.vin}
            onChange={handleChange}
            maxLength="17"
            required
          />
          <input
            name="license_plate"
            placeholder="License Plate"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brandRed focus:border-transparent"
            value={form.license_plate}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="bg-primary text-white w-full py-3 rounded-lg font-semibold hover:bg-black transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
          </button>
        </form>

        {message && (
          <p className={`text-center mt-4 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </>
  );
}