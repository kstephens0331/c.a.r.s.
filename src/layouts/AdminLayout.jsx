import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.js'; // Ensure this path is correct

export default function AdminLayout() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // New state to track admin status
  const [loading, setLoading] = useState(true); // New loading state for auth check
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndAdminStatus = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // DEBUG LOG 1: Initial session data check
      console.log('AdminLayout DEBUG: --- Starting Auth/Admin Check ---');
      console.log('AdminLayout DEBUG: Session retrieved:', session);
      console.log('AdminLayout DEBUG: Session error:', sessionError);

      if (sessionError || !session) {
        // No session found, redirect to login
        console.log('AdminLayout DEBUG: No active session, redirecting to /login');
        navigate('/login');
        setLoading(false);
        return;
      }

      setSession(session);

      // Fetch user profile to check admin status
      console.log('AdminLayout DEBUG: Attempting to fetch profile for user ID:', session.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      // DEBUG LOG 2: Profile data and error check
      console.log('AdminLayout DEBUG: Profile data retrieved:', profile);
      console.log('AdminLayout DEBUG: Profile error:', profileError);

      if (profileError) {
        console.error('AdminLayout DEBUG: Error fetching profile:', profileError.message);
        // If there's an error fetching the profile, treat as unauthorized or redirect
        console.warn('AdminLayout DEBUG: Profile fetch error, redirecting to /portal');
        navigate('/portal');
        setIsAdmin(false);
      } else if (!profile || !profile.is_admin) {
        // User is logged in but profile is missing or is_admin is false
        console.warn('AdminLayout DEBUG: User is NOT an admin. Profile exists:', !!profile, 'is_admin:', profile?.is_admin, 'Redirecting to /portal');
        navigate('/portal'); // Redirect to customer portal or an unauthorized page
        setIsAdmin(false);
      } else {
        console.log('AdminLayout DEBUG: User IS an admin. Granting access.');
        setIsAdmin(true);
      }
      setLoading(false);
      console.log('AdminLayout DEBUG: --- Auth/Admin Check Complete ---');
    };

    checkAuthAndAdminStatus();

    // Set up auth state change listener for real-time updates/re-checks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AdminLayout DEBUG: Auth state changed event:', _event, 'New session:', session);
      if (!session) {
        console.log('AdminLayout DEBUG: Session ended, redirecting to /login');
        navigate('/login');
        setIsAdmin(false);
      } else {
        // Re-check admin status if session changes (e.g., after login/logout in another tab, or refresh)
        checkAuthAndAdminStatus();
      }
    });

    return () => {
      if (subscription) {
        console.log('AdminLayout DEBUG: Unsubscribing from auth state changes.');
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const handleLogout = async () => {
    console.log('AdminLayout DEBUG: Logging out...');
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent text-primary">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  // If not admin and loading is false, the redirect should have already happened.
  // This render is only if isAdmin is true or if redirect is pending
  if (!isAdmin) {
    // This case should ideally not be reached if redirects are working correctly immediately.
    // It acts as a fallback or a momentary state if a redirect is pending.
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
        {/* Use Link components for navigation */}
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
