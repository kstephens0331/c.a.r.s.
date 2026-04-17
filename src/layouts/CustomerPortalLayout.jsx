// layouts/CustomerPortalLayout.jsx
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.js'; // Ensure path is correct

export default function CustomerPortalLayout() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthChange = async (currentSession) => {
      if (!currentSession) {
        navigate('/login', { replace: true });
        return;
      }

      setSession(currentSession);

      if (location.hash.includes('access_token')) {
        navigate(location.pathname, { replace: true });
        return;
      }

      // Ensure profile exists
const { data: existingProfile, error: fetchError } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', currentSession.user.id)
  .maybeSingle();

if (!existingProfile && !fetchError) {
  const { full_name } = currentSession.user.user_metadata || {};
  await supabase.from('profiles').insert([
    {
      id: currentSession.user.id,
      full_name: full_name || null,
      is_admin: false,
      created_at: new Date().toISOString(),
    },
  ]);
}

// Ensure customer record exists
const { data: existingCustomer, error: customerCheckError } = await supabase
  .from('customers')
  .select('id')
  .eq('user_id', currentSession.user.id)
  .maybeSingle();

if (!existingCustomer && !customerCheckError) {
  await supabase.from('customers').insert([
    {
      user_id: currentSession.user.id,
      name: currentSession.user.user_metadata?.full_name || 'Unknown',
      email: currentSession.user.email || null,
      phone: null,
      address: null
    }
  ]);
}


      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentSession.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }

      if (profile?.is_admin) {
        navigate('/admin', { replace: true });
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      handleAuthChange(session);
      if (error) console.error("Error getting session:", error.message);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate, location.hash]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  if (!session) {
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
