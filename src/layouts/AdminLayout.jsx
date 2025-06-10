import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function AdminLayout() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/login');
      else setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <a href="/admin" className="hover:text-brandRed">Dashboard</a>
        <a href="/admin/work-orders" className="hover:text-brandRed">Work Orders</a>
        <a href="/admin/inventory" className="hover:text-brandRed">Inventory</a>
        <a href="/admin/invoices" className="hover:text-brandRed">Invoices</a>
        <a href="/admin/photos" className="hover:text-brandRed">Photo Uploads</a>
        <button
          onClick={handleLogout}
          className="mt-auto text-sm text-white border-t border-white/30 pt-4 hover:text-red-400"
        >
          Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white text-primary p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
