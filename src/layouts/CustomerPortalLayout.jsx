// layouts/CustomerPortalLayout.jsx (Full code, new Link for My Documents)
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.js'; // Ensure path is correct

export default function CustomerPortalLayout() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      setSession(session);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for Customer Portal */}
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Customer Portal</h2>
        <Link to="/portal" className="hover:text-brandRed">Dashboard</Link>
        <Link to="/portal/my-vehicles" className="hover:text-brandRed">My Vehicles</Link>
        <Link to="/portal/add-vehicle" className="hover:text-brandRed">Add New Vehicle</Link>
        <Link to="/portal/repair-updates" className="hover:text-brandRed">Repair Updates</Link>
        <Link to="/portal/repair-photos" className="hover:text-brandRed">Repair Photos</Link>
        <Link to="/portal/my-documents" className="hover:text-brandRed">My Documents</Link> {/* NEW LINK */}
        <button
          onClick={handleLogout}
          className="mt-auto text-sm text-white border-t border-white/30 pt-4 hover:text-red-400"
        >
          Log Out
        </button>
      </aside>

      {/* Main Content Area for nested routes */}
      <main className="flex-1 bg-white text-primary p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
