import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js';

const ACTIVE_EXCLUDE = '("Complete", "Ready for Pickup")';

function dayBounds() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  return { today, tomorrow };
}

// A KPI card matching the existing dashboard style. Optional drill-through + delta.
function StatCard({ value, label, to, delta }) {
  const inner = (
    <div className="bg-accent p-6 rounded-lg shadow-md text-center h-full">
      <h2 className="text-4xl font-bold text-brandRed">{value}</h2>
      <p className="text-primary mt-2">{label}</p>
      {typeof delta === 'number' && (
        <p className={`mt-1 text-sm font-semibold ${delta > 0 ? 'text-green-700' : delta < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {delta > 0 ? '▲' : delta < 0 ? '▼' : '■'} {Math.abs(delta)} vs prior 30d
        </p>
      )}
    </div>
  );
  return to
    ? <Link to={to} className="block hover:opacity-90 transition-opacity">{inner}</Link>
    : inner;
}

export default function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asOf, setAsOf] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { today, tomorrow } = dayBounds();
      const now = new Date();
      const d30 = new Date(now); d30.setDate(now.getDate() - 30);
      const d60 = new Date(now); d60.setDate(now.getDate() - 60);
      const head = { count: 'exact', head: true };

      const [active, completed, customers, vehiclesToday, newCust30, newCustPrev30, invoices] = await Promise.all([
        supabase.from('work_orders').select('id', head).not('current_status', 'in', ACTIVE_EXCLUDE),
        supabase.from('work_orders').select('id', head).eq('current_status', 'Complete').gte('updated_at', today.toISOString()).lt('updated_at', tomorrow.toISOString()),
        supabase.from('customers').select('id', head),
        supabase.from('vehicles').select('id', head).gte('created_at', today.toISOString()).lt('created_at', tomorrow.toISOString()),
        supabase.from('customers').select('id', head).gte('created_at', d30.toISOString()),
        supabase.from('customers').select('id', head).gte('created_at', d60.toISOString()).lt('created_at', d30.toISOString()),
        supabase.from('invoices').select('id', head),
      ]);

      const firstErr = [active, completed, customers, vehiclesToday, newCust30, newCustPrev30, invoices].find(r => r.error);
      if (firstErr) throw new Error(firstErr.error.message);

      setStats({
        activeWorkOrders: active.count || 0,
        completedToday: completed.count || 0,
        totalCustomers: customers.count || 0,
        vehiclesAddedToday: vehiclesToday.count || 0,
        newCustomers30: newCust30.count || 0,
        newCustomersDelta: (newCust30.count || 0) - (newCustPrev30.count || 0),
        invoices: invoices.count || 0,
      });
      setAsOf(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err.message);
      setError(`Failed to load dashboard stats: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin | C.A.R.S Collision & Refinish Shop</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin dashboard with key metrics and quick links." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-lg">Overview of key shop metrics.</p>
          </div>
          <div className="text-right">
            <button onClick={fetchStats} className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-black">
              Refresh
            </button>
            {asOf && <p className="text-xs text-gray-500 mt-1">as of {asOf.toLocaleTimeString()}</p>}
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {loading && !stats && <p className="text-gray-600">Loading dashboard data…</p>}

        {stats && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard value={stats.activeWorkOrders} label="Active Work Orders" to="/admin/work-orders" />
              <StatCard value={stats.completedToday} label="Completed Today" to="/admin/work-orders" />
              <StatCard value={stats.vehiclesAddedToday} label="Vehicles Added Today" />
              <StatCard value={stats.totalCustomers} label="Total Customers" to="/admin/customers" />
              <StatCard value={stats.newCustomers30} label="New Customers (30d)" to="/admin/customers" delta={stats.newCustomersDelta} />
              <StatCard value={stats.invoices} label="Invoices on File" to="/admin/invoices" />
            </div>
            <p className="text-xs text-gray-500">Tip: click a card to drill into the underlying records.</p>
          </>
        )}

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/admin/customers/add" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">Add New Customer</Link>
            <Link to="/admin/work-orders" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">Manage Work Orders</Link>
            <Link to="/admin/inventory" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">View Inventory</Link>
            <Link to="/admin/photos" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">Upload Repair Photos</Link>
            <Link to="/admin/customers" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">View All Customers</Link>
            <Link to="/admin/reports" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">View Reports</Link>
          </div>
        </div>
      </div>
    </>
  );
}
