// layouts/CustomerPortalLayout.jsx
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.js'; // Ensure path is correct

export default function CustomerPortalLayout() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  useEffect(() => {
    const handleAuthChange = async (currentSession) => {
      // If there's no session, redirect to login
      if (!currentSession) {
        navigate('/login', { replace: true }); // Use replace: true
        return;
      }
      setSession(currentSession);

      // If the current URL contains access tokens (e.g., after OAuth redirect),
      // navigate to a clean URL to strip them.
      if (location.hash.includes('access_token')) {
        navigate(location.pathname, { replace: true }); // Redirect to current path without hash
        return;
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      handleAuthChange(session);
      if (error) console.error("Error getting session:", error.message);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate, location.hash]); // Re-run effect if hash changes

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true }); // Use replace: true
  };

  if (!session) {
    // Optionally render a loading or redirecting message while session is being checked
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent text-primary">
        <p>Checking authentication...</p>
      </div>
    );
  }

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
        <Link to="/portal/my-documents" className="hover:text-brandRed">My Documents</Link>
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
