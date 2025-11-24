import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function AddInventoryItemForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    part_number: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    supplier: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unit_price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.part_number || !formData.description) {
        throw new Error('Part number and description are required');
      }

      if (formData.quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      if (formData.unit_price < 0) {
        throw new Error('Unit price cannot be negative');
      }

      // Insert new inventory item
      const { data, error: insertError } = await supabase
        .from('inventory')
        .insert([{
          part_number: formData.part_number.trim(),
          description: formData.description.trim(),
          quantity: formData.quantity,
          unit_price: formData.unit_price,
          supplier: formData.supplier.trim() || null
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Success
      if (onSuccess) {
        onSuccess(data);
      }

      // Reset form
      setFormData({
        part_number: '',
        description: '',
        quantity: 0,
        unit_price: 0,
        supplier: ''
      });
    } catch (err) {
      console.error('Error adding inventory item:', err);
      setError(err.message || 'Failed to add inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Add New Inventory Item</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="part_number" className="block text-sm font-medium mb-1">
            Part Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="part_number"
            name="part_number"
            value={formData.part_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., BP-001"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Front Bumper Cover - OEM"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="unit_price" className="block text-sm font-medium mb-1">
              Unit Price ($)
            </label>
            <input
              type="number"
              id="unit_price"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="supplier" className="block text-sm font-medium mb-1">
            Supplier
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., AutoZone, NAPA"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
