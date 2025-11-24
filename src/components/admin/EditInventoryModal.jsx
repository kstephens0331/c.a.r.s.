import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function EditInventoryModal({ item, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    part_number: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    supplier: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        part_number: item.part_number || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        supplier: item.supplier || ''
      });
    }
  }, [item]);

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

      // Update inventory item
      const { data, error: updateError } = await supabase
        .from('inventory')
        .update({
          part_number: formData.part_number.trim(),
          description: formData.description.trim(),
          quantity: formData.quantity,
          unit_price: formData.unit_price,
          supplier: formData.supplier.trim() || null
        })
        .eq('id', item.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Success
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error('Error updating inventory item:', err);
      setError(err.message || 'Failed to update inventory item');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Edit Inventory Item</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit_part_number" className="block text-sm font-medium mb-1">
                Part Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit_part_number"
                name="part_number"
                value={formData.part_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="edit_description" className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="edit_description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit_quantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="edit_quantity"
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
                <label htmlFor="edit_unit_price" className="block text-sm font-medium mb-1">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  id="edit_unit_price"
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
              <label htmlFor="edit_supplier" className="block text-sm font-medium mb-1">
                Supplier
              </label>
              <input
                type="text"
                id="edit_supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
