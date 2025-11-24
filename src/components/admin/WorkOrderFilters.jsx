import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useStore } from '../../store/useStore';

/**
 * WorkOrderFilters Component
 * Advanced filtering for work orders by status, customer, and date range
 */
const WorkOrderFilters = ({ onFilterChange }) => {
  const { workOrderFilters, setWorkOrderFilters, resetWorkOrderFilters } = useStore();
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch customers for filter dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');

      if (data) {
        setCustomers(data);
      }
    };

    fetchCustomers();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...workOrderFilters, [key]: value };
    setWorkOrderFilters({ [key]: value });
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    resetWorkOrderFilters();
    onFilterChange({
      status: 'all',
      customer: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const activeFilterCount = Object.values(workOrderFilters).filter(
    (value) => value && value !== 'all'
  ).length;

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
              <h3 className="text-lg font-semibold">Filter Work Orders</h3>
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
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={workOrderFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="awaiting-parts">Awaiting Parts</option>
                  <option value="ready-for-pickup">Ready for Pickup</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select
                  value={workOrderFilters.customer}
                  onChange={(e) => handleFilterChange('customer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date range filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={16} className="inline mr-1" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={workOrderFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={workOrderFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="To"
                  />
                </div>
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

export default WorkOrderFilters;
