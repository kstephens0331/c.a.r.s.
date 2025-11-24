import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct
import { Link } from 'react-router-dom'; // Import Link
import Pagination from '../../components/Pagination'; // Import pagination component
import { TableSkeleton } from '../../components/LoadingSkeletons'; // Import loading skeleton
import { Search, X, UserPlus } from 'lucide-react';

const ITEMS_PER_PAGE = 50; // Show 50 customers per page

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let isCancelled = false; // For cleanup

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Calculate pagination range
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        // Build query
        let query = supabase
          .from('customers')
          .select('id, name, phone, address, email, user_id, created_at', { count: 'exact' });

        // Apply search filter if query exists
        if (searchQuery.trim()) {
          query = query.or(
            `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
          );
        }

        // Apply pagination and ordering
        const { data, error: fetchError, count } = await query
          .order('created_at', { ascending: false })
          .range(start, end);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Only update state if component is still mounted
        if (!isCancelled) {
          setCustomers(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching customers:', err);
          setError(`Failed to load customers: ${err.message}`);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setSearching(false);
        }
      }
    };

    fetchCustomers();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [currentPage, searchQuery]); // Re-fetch when page or search changes

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
    setSearching(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Customers | Collision & Refinish Shop</title>
          <meta name="description" content="View and manage customer accounts and their linked vehicles." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Customer Records</h1>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Loading customers...</p>
          </div>
          <TableSkeleton rows={10} columns={6} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Customers | Collision & Refinish Shop</title>
          <meta name="description" content="View and manage customer accounts and their linked vehicles." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Customer Records</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customers | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="View and manage customer accounts and their linked vehicles."
        />
      </Helmet>

      <div className="space-y-6">
        {/* Header with search and add button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Customer Records</h1>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-80">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search customers by name, email, or phone..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Add Customer Button */}
            <Link
              to="/admin/customers/add"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <UserPlus size={20} />
              <span className="hidden md:inline">Add Customer</span>
            </Link>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <span>
              Found {totalCount} customer{totalCount !== 1 ? 's' : ''} matching "{searchQuery}"
            </span>
            <button
              onClick={clearSearch}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Clear Search
            </button>
          </div>
        )}

        {customers.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No customers found matching "{searchQuery}"</p>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search and view all customers
                </button>
              </>
            ) : (
              <>
                <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-4">No customers found</p>
                <Link
                  to="/admin/customers/add"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={20} />
                  Add Your First Customer
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-accent text-left">
                  <tr>
                    <th className="p-3 border-b">Name</th>
                    <th className="p-3 border-b">Phone</th>
                    <th className="p-3 border-b">Email</th>
                    <th className="p-3 border-b">Address</th>
                    <th className="p-3 border-b">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">
                        <Link to={`/admin/customers/${cust.id}`} className="text-brandRed hover:underline font-semibold">
                          {cust.name || 'N/A'}
                        </Link>
                      </td>
                      <td className="p-3 border-b">{cust.phone || 'N/A'}</td>
                      <td className="p-3 border-b">{cust.email || 'N/A'}</td>
                      <td className="p-3 border-b">{cust.address || 'N/A'}</td>
                      <td className="p-3 border-b">
                        {new Date(cust.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
}
