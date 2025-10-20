import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js';

export default function WorkOrdersListView() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'all'
  const navigate = useNavigate();

  const statuses = [
    'Estimate Scheduled',
    'Parts Ordered',
    'Parts Received',
    'Repairs Started',
    'Paint',
    'Quality Check',
    'Complete',
    'Ready for Pickup'
  ];

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('work_orders')
        .select(`
          id,
          created_at,
          updated_at,
          work_order_number,
          current_status,
          description,
          estimated_completion_date,
          vehicle_id,
          vehicles (
            make,
            model,
            year,
            customer_id
          ),
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching work orders:', fetchError.message);
        setError(`Failed to load work orders: ${fetchError.message}`);
      } else {
        setWorkOrders(data || []);
      }
      setLoading(false);
    };

    fetchWorkOrders();
  }, []);

  // Group work orders by status
  const groupedWorkOrders = statuses.reduce((acc, status) => {
    acc[status] = workOrders.filter(wo => wo.current_status === status);
    return acc;
  }, {});

  // Get overdue work orders
  const overdueWorkOrders = workOrders.filter(wo => {
    if (!wo.estimated_completion_date) return false;
    const estDate = new Date(wo.estimated_completion_date);
    const today = new Date();
    return estDate < today && wo.current_status !== 'Complete' && wo.current_status !== 'Ready for Pickup';
  });

  // Check if a work order is overdue
  const isOverdue = (wo) => {
    if (!wo.estimated_completion_date) return false;
    const estDate = new Date(wo.estimated_completion_date);
    const today = new Date();
    return estDate < today && wo.current_status !== 'Complete' && wo.current_status !== 'Ready for Pickup';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render a single work order row
  const WorkOrderRow = ({ wo, showStatus = true }) => {
    const customerName = wo.customers?.name || 'N/A';
    const vehicle = `${wo.vehicles?.year || ''} ${wo.vehicles?.make || ''} ${wo.vehicles?.model || ''}`.trim() || 'N/A';
    const repairStartDate = formatDate(wo.created_at);
    const estimatedCompletion = formatDate(wo.estimated_completion_date);
    const overdueStatus = isOverdue(wo);

    return (
      <tr
        key={wo.id}
        className={`border-b hover:bg-gray-50 cursor-pointer ${overdueStatus ? 'bg-red-50' : ''}`}
        onClick={() => navigate(`/admin/work-orders/details/${wo.id}`)}
      >
        <td className="p-3 font-medium">{wo.work_order_number}</td>
        <td className="p-3">{customerName}</td>
        <td className="p-3">{vehicle}</td>
        <td className="p-3">{repairStartDate}</td>
        {showStatus && (
          <td className="p-3">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              wo.current_status === 'Complete' || wo.current_status === 'Ready for Pickup'
                ? 'bg-green-100 text-green-800'
                : overdueStatus
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {wo.current_status}
            </span>
          </td>
        )}
        <td className={`p-3 ${overdueStatus ? 'text-red-600 font-semibold' : ''}`}>
          {estimatedCompletion}
          {overdueStatus && <span className="ml-2 text-xs">(OVERDUE)</span>}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Work Orders | C.A.R.S Admin</title>
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p>Loading work orders...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Work Orders | C.A.R.S Admin</title>
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Work Orders | C.A.R.S Admin</title>
        <meta name="description" content="Manage all work orders and track repair progress" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Work Orders Overview</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-4 py-2 rounded ${
                viewMode === 'grouped'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grouped by Status
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded ${
                viewMode === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Work Orders
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800">Active Work Orders</h3>
            <p className="text-3xl font-bold text-blue-900">{workOrders.filter(wo => wo.current_status !== 'Complete' && wo.current_status !== 'Ready for Pickup').length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-green-800">Completed</h3>
            <p className="text-3xl font-bold text-green-900">{workOrders.filter(wo => wo.current_status === 'Complete' || wo.current_status === 'Ready for Pickup').length}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-sm font-semibold text-red-800">Overdue</h3>
            <p className="text-3xl font-bold text-red-900">{overdueWorkOrders.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Total</h3>
            <p className="text-3xl font-bold text-gray-900">{workOrders.length}</p>
          </div>
        </div>

        {/* Overdue Section */}
        {overdueWorkOrders.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-xl font-bold text-red-800 mb-4">⚠️ Overdue Work Orders ({overdueWorkOrders.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded">
                <thead className="bg-red-100 text-left">
                  <tr>
                    <th className="p-3 font-semibold">WO #</th>
                    <th className="p-3 font-semibold">Customer</th>
                    <th className="p-3 font-semibold">Vehicle</th>
                    <th className="p-3 font-semibold">Started</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueWorkOrders.map(wo => <WorkOrderRow key={wo.id} wo={wo} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Main View */}
        {viewMode === 'grouped' ? (
          // Grouped View
          <div className="space-y-6">
            {statuses.map(status => {
              const statusWorkOrders = groupedWorkOrders[status] || [];
              if (statusWorkOrders.length === 0) return null;

              return (
                <div key={status} className="bg-white border rounded-lg overflow-hidden">
                  <div className="bg-accent p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center justify-between">
                      <span>{status}</span>
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                        {statusWorkOrders.length}
                      </span>
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 text-left text-sm">
                        <tr>
                          <th className="p-3 font-semibold">WO #</th>
                          <th className="p-3 font-semibold">Customer</th>
                          <th className="p-3 font-semibold">Vehicle</th>
                          <th className="p-3 font-semibold">Started</th>
                          <th className="p-3 font-semibold">Est. Completion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statusWorkOrders.map(wo => <WorkOrderRow key={wo.id} wo={wo} showStatus={false} />)}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // All Work Orders View
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3 font-semibold">WO #</th>
                    <th className="p-3 font-semibold">Customer</th>
                    <th className="p-3 font-semibold">Vehicle</th>
                    <th className="p-3 font-semibold">Started</th>
                    <th className="p-3 font-semibold">Current Status</th>
                    <th className="p-3 font-semibold">Est. Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map(wo => <WorkOrderRow key={wo.id} wo={wo} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {workOrders.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No work orders found</p>
          </div>
        )}
      </div>
    </>
  );
}
