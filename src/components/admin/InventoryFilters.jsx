import React, { useState, useEffect } from 'react';
import { Filter, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useStore } from '../../store/useStore';

/**
 * InventoryFilters Component
 * Advanced filtering for inventory by supplier and low stock alerts
 */
const InventoryFilters = ({ onFilterChange }) => {
  const { inventoryFilters, setInventoryFilters, resetInventoryFilters } = useStore();
  const [suppliers, setSuppliers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unique suppliers for filter dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('supplier')
        .not('supplier', 'is', null)
        .order('supplier');

      if (data) {
        // Get unique suppliers
        const uniqueSuppliers = [...new Set(data.map((item) => item.supplier))];
        setSuppliers(uniqueSuppliers);
      }
    };

    fetchSuppliers();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...inventoryFilters, [key]: value };
    setInventoryFilters({ [key]: value });
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    resetInventoryFilters();
    onFilterChange({
      supplier: 'all',
      lowStock: false,
      searchTerm: '',
    });
  };

  const activeFilterCount =
    (inventoryFilters.supplier !== 'all' ? 1 : 0) +
    (inventoryFilters.lowStock ? 1 : 0) +
    (inventoryFilters.searchTerm ? 1 : 0);

  return (
    <div className="relative">
      {/* Filter toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Toggle filters"
      >
        <Filter size={16} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Filter panel */}
          <div className="absolute right-0 z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Filter Inventory</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter options */}
            <div className="p-4 space-y-4">
              {/* Search filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Part Number or Description
                </label>
                <input
                  type="text"
                  value={inventoryFilters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Supplier filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <select
                  value={inventoryFilters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Low stock filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inventoryFilters.lowStock}
                    onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <AlertTriangle size={16} className="inline mr-1 text-yellow-500" />
                    Show Low Stock Only (≤ 5 units)
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryFilters;
