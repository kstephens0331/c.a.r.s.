import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Car, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useStore } from '../store/useStore';

/**
 * GlobalSearch Component
 * Provides real-time search across customers, vehicles, and work orders
 * Uses keyboard shortcuts (Ctrl+K / Cmd+K) for quick access
 */
const GlobalSearch = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], vehicles: [], workOrders: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Listen for keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ customers: [], vehicles: [], workOrders: [] });
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        // Search customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id, name, email, phone')
          .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
          .limit(5);

        // Search vehicles
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select(`
            id,
            make,
            model,
            year,
            vin,
            license_plate,
            customers (name)
          `)
          .or(`make.ilike.%${query}%,model.ilike.%${query}%,vin.ilike.%${query}%,license_plate.ilike.%${query}%`)
          .limit(5);

        // Search work orders
        const { data: workOrders } = await supabase
          .from('work_orders')
          .select(`
            id,
            work_order_number,
            current_status,
            description,
            vehicles (
              make,
              model,
              year,
              customers (name)
            )
          `)
          .or(`work_order_number.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5);

        setResults({
          customers: customers || [],
          vehicles: vehicles || [],
          workOrders: workOrders || [],
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Handle result selection
  const handleSelect = (type, id) => {
    setIsOpen(false);
    setQuery('');

    switch (type) {
      case 'customer':
        navigate(`/admin/customers/${id}`);
        break;
      case 'vehicle':
        navigate(`/portal/vehicles/${id}`);
        break;
      case 'workOrder':
        navigate(`/admin/work-orders/details/${id}`);
        break;
      default:
        break;
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const allResults = [
      ...results.customers.map((c) => ({ type: 'customer', id: c.id })),
      ...results.vehicles.map((v) => ({ type: 'vehicle', id: v.id })),
      ...results.workOrders.map((w) => ({ type: 'workOrder', id: w.id })),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      const selected = allResults[selectedIndex];
      handleSelect(selected.type, selected.id);
    }
  };

  const totalResults = results.customers.length + results.vehicles.length + results.workOrders.length;

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Open search"
      >
        <Search size={16} />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-block px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
          Ctrl+K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50">
          <div
            ref={searchRef}
            className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <Search size={20} className="text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search customers, vehicles, work orders..."
                className="flex-1 outline-none text-lg"
                aria-label="Search query"
              />
              {loading && <Loader2 size={20} className="animate-spin text-blue-500" />}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search results */}
            <div className="max-h-96 overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Type at least 2 characters to search</p>
                  <p className="text-sm mt-2">Search across customers, vehicles, and work orders</p>
                </div>
              ) : totalResults === 0 && !loading ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <>
                  {/* Customers */}
                  {results.customers.length > 0 && (
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Customers
                      </div>
                      {results.customers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelect('customer', customer.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <User size={20} className="text-blue-500" />
                          <div className="flex-1">
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              {customer.email} • {customer.phone}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Vehicles */}
                  {results.vehicles.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Vehicles
                      </div>
                      {results.vehicles.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          onClick={() => handleSelect('vehicle', vehicle.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Car size={20} className="text-green-500" />
                          <div className="flex-1">
                            <div className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              VIN: {vehicle.vin} • Owner: {vehicle.customers?.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Work Orders */}
                  {results.workOrders.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Work Orders
                      </div>
                      {results.workOrders.map((wo) => (
                        <button
                          key={wo.id}
                          onClick={() => handleSelect('workOrder', wo.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <FileText size={20} className="text-orange-500" />
                          <div className="flex-1">
                            <div className="font-medium">WO #{wo.work_order_number}</div>
                            <div className="text-sm text-gray-500">
                              {wo.vehicles?.year} {wo.vehicles?.make} {wo.vehicles?.model} •{' '}
                              <span className="capitalize">{wo.current_status}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↑</kbd>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded ml-1">↓</kbd> to navigate
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Enter</kbd> to select
                </span>
              </div>
              <span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Esc</kbd> to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
