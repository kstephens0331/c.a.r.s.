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

  // Edit/Delete modal states
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  // Handle Edit Inventory Item
  const handleEditItem = (item) => {
    setEditingItem({...item});
    setShowEditModal(true);
  };

  // Handle Save Edited Item
  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          part_number: editingItem.part_number,
          description: editingItem.description,
          quantity: parseInt(editingItem.quantity),
          unit_price: parseFloat(editingItem.unit_price),
          supplier: editingItem.supplier
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      // Update local state
      setInventoryItems(prev => prev.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));

      setShowEditModal(false);
      setEditingItem(null);
      alert('Inventory item updated successfully!');
    } catch (err) {
      console.error('Error updating inventory:', err);
      alert(`Failed to update inventory: ${err.message}`);
    }
  };

  // Handle Delete Inventory Item
  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      // Update local state
      setInventoryItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setTotalCount(prev => prev - 1);

      setShowDeleteConfirm(false);
      setItemToDelete(null);
      alert('Inventory item deleted successfully!');
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      alert(`Failed to delete inventory item: ${err.message}`);
    }
  };

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
                    <th className="p-3 border-b">Actions</th>
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
                      <td className="p-3 border-b">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
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

        {/* Edit Inventory Item Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Inventory Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Part Number</label>
                  <input
                    type="text"
                    value={editingItem.part_number || ''}
                    onChange={(e) => setEditingItem({...editingItem, part_number: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editingItem.quantity || 0}
                    onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.unit_price || ''}
                    onChange={(e) => setEditingItem({...editingItem, unit_price: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier</label>
                  <input
                    type="text"
                    value={editingItem.supplier || ''}
                    onChange={(e) => setEditingItem({...editingItem, supplier: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {setShowEditModal(false); setEditingItem(null);}}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Confirm Delete</h2>
              <p className="mb-4">
                Are you sure you want to delete part <strong>{itemToDelete.part_number}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {setShowDeleteConfirm(false); setItemToDelete(null);}}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
