import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js'; // Ensure this path is correct

export default function AdminDashboardContent() {
  const [stats, setStats] = useState({
    activeWorkOrders: 0,
    completedWorkOrdersToday: 0,
    totalCustomers: 0,
    vehiclesAddedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Active Work Orders (not 'Complete' or 'Ready for Pickup')
        const { count: activeWoCount, error: activeWoError } = await supabase
          .from('work_orders')
          .select('*', { count: 'exact' })
          .not('current_status', 'in', '("Complete", "Ready for Pickup")'); // Adjust statuses as needed

        if (activeWoError) throw new Error(activeWoError.message);

        // Fetch Completed Work Orders Today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

        const { count: completedTodayCount, error: completedTodayError } = await supabase
          .from('work_orders')
          .select('*', { count: 'exact' })
          .eq('current_status', 'Complete') // Or 'Ready for Pickup'
          .gte('updated_at', today.toISOString())
          .lt('updated_at', tomorrow.toISOString());

        if (completedTodayError) throw new Error(completedTodayError.message);

        // Fetch Total Customers
        const { count: totalCustomersCount, error: customersError } = await supabase
          .from('profiles') // Assuming profiles table has all customers
          .select('*', { count: 'exact' });

        if (customersError) throw new Error(customersError.message);

        // Fetch Vehicles Added Today
        const { count: vehiclesTodayCount, error: vehiclesTodayError } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact' })
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString());

        if (vehiclesTodayError) throw new Error(vehiclesTodayError.message);


        setStats({
          activeWorkOrders: activeWoCount,
          completedWorkOrdersToday: completedTodayCount,
          totalCustomers: totalCustomersCount,
          vehiclesAddedToday: vehiclesTodayCount,
        });

      } catch (err) {
        console.error('Error fetching dashboard stats:', err.message);
        setError(`Failed to load dashboard stats: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin | C.A.R.S Collision & Refinish Shop</title>
        <meta name="description" content="Admin dashboard with key metrics and quick links." />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-lg">Overview of key shop metrics.</p>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-accent p-6 rounded-lg shadow-md text-center">
            <h2 className="text-4xl font-bold text-brandRed">{stats.activeWorkOrders}</h2>
            <p className="text-primary mt-2">Active Work Orders</p>
          </div>
          <div className="bg-accent p-6 rounded-lg shadow-md text-center">
            <h2 className="text-4xl font-bold text-brandRed">{stats.completedWorkOrdersToday}</h2>
            <p className="text-primary mt-2">Completed Today</p>
          </div>
          <div className="bg-accent p-6 rounded-lg shadow-md text-center">
            <h2 className="text-4xl font-bold text-brandRed">{stats.totalCustomers}</h2>
            <p className="text-primary mt-2">Total Customers</p>
          </div>
          <div className="bg-accent p-6 rounded-lg shadow-md text-center">
            <h2 className="text-4xl font-bold text-brandRed">{stats.vehiclesAddedToday}</h2>
            <p className="text-primary mt-2">Vehicles Added Today</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/admin/customers/add" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">
              Add New Customer
            </Link>
            <Link to="/admin/work-orders" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">
              Manage Work Orders
            </Link>
            <Link to="/admin/inventory" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">
              View Inventory
            </Link>
            <Link to="/admin/photos" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">
              Upload Repair Photos
            </Link>
            <Link to="/admin/customers" className="bg-primary text-white p-4 rounded-lg shadow-md hover:bg-black transition-colors duration-200 text-center font-semibold">
              View All Customers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}