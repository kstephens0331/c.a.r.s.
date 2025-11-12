import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.js'; // Ensure this path is correct
import { logger } from '../utils/logger'; // Safe logging utility

export default function AdminLayout() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  useEffect(() => {
    const checkAuthAndAdminStatus = async (currentSession) => {
      setLoading(true);

      // DEBUG LOG 1: Initial session data check
      logger.debug('AdminLayout: Starting Auth/Admin Check');
      logger.debug('AdminLayout: Session retrieved:', currentSession);

      if (!currentSession) {
        logger.debug('AdminLayout: No active session, redirecting to /login');
        navigate('/login', { replace: true }); // Use replace: true
        setLoading(false);
        return;
      }
      setSession(currentSession);

      // If the current URL contains access tokens (e.g., after OAuth redirect),
      // navigate to a clean URL to strip them.
      if (location.hash.includes('access_token')) {
        navigate(location.pathname, { replace: true }); // Redirect to current path without hash
        setLoading(false); // Stop loading while redirecting
        return;
      }

      const { data: existingProfile, error: fetchError } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', currentSession.user.id)
  .maybeSingle();

if (!existingProfile && !fetchError) {
  logger.warn('AdminLayout: Profile not found, inserting...');
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

// Always check if a customer exists, even if the profile already existed
const { data: existingCustomer, error: customerCheckError } = await supabase
  .from('customers')
  .select('id')
  .eq('user_id', currentSession.user.id)
  .maybeSingle();

if (!existingCustomer && !customerCheckError) {
  logger.warn('AdminLayout: Customer not found, inserting...');
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

      // Fetch user profile to check admin status
      logger.debug('AdminLayout: Attempting to fetch profile for user ID:', currentSession.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentSession.user.id)
        .single();

      // DEBUG LOG 2: Profile data and error check
      logger.debug('AdminLayout: Profile data retrieved:', profile);
      logger.debug('AdminLayout: Profile error:', profileError);

      if (profileError) {
        logger.error('AdminLayout: Error fetching profile:', profileError.message);
        logger.warn('AdminLayout: Profile fetch error, redirecting to /portal');
        navigate('/portal', { replace: true }); // Use replace: true
        setIsAdmin(false);
      } else if (!profile || !profile.is_admin) {
        logger.warn('AdminLayout: User is NOT an admin. Profile exists:', !!profile, 'is_admin:', profile?.is_admin, 'Redirecting to /portal');
        navigate('/portal', { replace: true }); // Use replace: true
        setIsAdmin(false);
      } else {
        logger.debug('AdminLayout: User IS an admin. Granting access.');
        setIsAdmin(true);
      }
      setLoading(false);
      logger.debug('AdminLayout: Auth/Admin Check Complete');
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      checkAuthAndAdminStatus(session);
      if (error) logger.error("Error getting initial session:", error.message);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.debug('AdminLayout: Auth state changed event:', _event, 'New session:', session);
      checkAuthAndAdminStatus(session);
    });

    return () => {
      if (subscription) {
        logger.debug('AdminLayout: Unsubscribing from auth state changes.');
        subscription.unsubscribe();
      }
    };
  }, [navigate, location.hash]); // Re-run effect if hash changes

  const handleLogout = async () => {
    console.log('AdminLayout DEBUG: Logging out...');
    await supabase.auth.signOut();
    navigate('/login', { replace: true }); // Use replace: true
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent text-primary">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent text-primary">
        <p>Access Denied. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <Link to="/admin" className="hover:text-brandRed">Dashboard</Link>
        <Link to="/admin/work-orders" className="hover:text-brandRed">Work Orders</Link>
        <Link to="/admin/inventory" className="hover:text-brandRed">Inventory</Link>
        <Link to="/admin/invoices" className="hover:text-brandRed">Invoices</Link>
        <Link to="/admin/photos" className="hover:text-brandRed">Photo Uploads</Link>
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