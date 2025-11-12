import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/LoadingSkeletons';

const ITEMS_PER_PAGE = 50; // Show 50 inventory items per page

export default function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        const { data, error: fetchError, count } = await supabase
          .from('inventory')
          .select('*', { count: 'exact' })
          .order('part_number', { ascending: true })
          .range(start, end);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!isCancelled) {
          setInventoryItems(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching inventory:', err);
          setError(`Failed to load inventory: ${err.message}`);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      isCancelled = true;
    };
  }, [currentPage]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Inventory | Collision & Refinish Shop</title>
          <meta name="description" content="Track and manage all parts used in repairs. View quantity, pricing, and suppliers." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Parts Inventory</h1>
          <p className="text-gray-600">Loading inventory...</p>
          <TableSkeleton rows={10} columns={6} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Inventory | Collision & Refinish Shop</title>
          <meta name="description" content="Track and manage all parts used in repairs. View quantity, pricing, and suppliers." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Parts Inventory</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Inventory | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Track and manage all parts used in repairs. View quantity and pricing."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Parts Inventory</h1>
        <p className="text-lg">Monitor available parts and add or adjust inventory as needed.</p>

        {inventoryItems.length === 0 ? (
          <p className="text-gray-500">No inventory items found. Add some from the backend!</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-accent text-left">
                  <tr>
                    <th className="p-3 border-b">Part #</th>
                    <th className="p-3 border-b">Description</th>
                    <th className="p-3 border-b">Quantity</th>
                    <th className="p-3 border-b">Price</th>
                    <th className="p-3 border-b">Supplier</th>
                    <th className="p-3 border-b">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{item.part_number}</td>
                      <td className="p-3 border-b">{item.description}</td>
                      <td className="p-3 border-b">{item.quantity}</td>
                      <td className="p-3 border-b">${item.unit_price ? parseFloat(item.unit_price).toFixed(2) : '0.00'}</td>
                      <td className="p-3 border-b">{item.supplier || 'N/A'}</td>
                      <td className="p-3 border-b">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</td>
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
