import React, { useState } from 'react';

export default function AdminAddVehicleForm({ customerId, onAddVehicle, message, addingVehicle }) {
  const [newVehicleForm, setNewVehicleForm] = useState({
    make: '', model: '', year: '', color: '', vin: '', license_plate: ''
  });

  const handleChange = (e) => {
    setNewVehicleForm({ ...newVehicleForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onAddVehicle(newVehicleForm); // Pass new vehicle data to parent handler
    // Reset form after submission is handled by parent (if successful)
    setNewVehicleForm({ make: '', model: '', year: '', color: '', vin: '', license_plate: '' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="make" value={newVehicleForm.make} onChange={handleChange} placeholder="Make" required className="w-full p-2 border rounded" />
        <input type="text" name="model" value={newVehicleForm.model} onChange={handleChange} placeholder="Model" required className="w-full p-2 border rounded" />
        <input type="number" name="year" value={newVehicleForm.year} onChange={handleChange} placeholder="Year" required className="w-full p-2 border rounded" />
        <input type="text" name="color" value={newVehicleForm.color} onChange={handleChange} placeholder="Color" className="w-full p-2 border rounded" />
        <input type="text" name="vin" value={newVehicleForm.vin} onChange={handleChange} placeholder="VIN" required maxLength="17" className="w-full p-2 border rounded" />
        <input type="text" name="license_plate" value={newVehicleForm.license_plate} onChange={handleChange} placeholder="License Plate" className="w-full p-2 border rounded" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={addingVehicle}>
          {addingVehicle ? 'Adding...' : 'Add Vehicle'}
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
