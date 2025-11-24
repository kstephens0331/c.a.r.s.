import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.js';
import { logger } from '../utils/logger';
import {
  LayoutDashboard,
  FileText,
  Package,
  FileBox,
  Image,
  Users,
  Calendar,
  BarChart3,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import DarkModeToggle from '../components/DarkModeToggle';
import Breadcrumbs from '../components/Breadcrumbs';
import Tooltip from '../components/Tooltip';

/**
 * ImprovedAdminLayout Component
 * Enhanced admin layout with mobile navigation, search, and dark mode
 */
export default function ImprovedAdminLayout() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndAdminStatus = async (currentSession) => {
      setLoading(true);

      logger.debug('ImprovedAdminLayout: Starting Auth/Admin Check');
      logger.debug('ImprovedAdminLayout: Session retrieved:', currentSession);

      if (!currentSession) {
        logger.debug('ImprovedAdminLayout: No active session, redirecting to /login');
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }
      setSession(currentSession);

      if (location.hash.includes('access_token')) {
        navigate(location.pathname, { replace: true });
        setLoading(false);
        return;
      }

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (!existingProfile && !fetchError) {
        logger.warn('ImprovedAdminLayout: Profile not found, inserting...');
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

      const { data: existingCustomer, error: customerCheckError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', currentSession.user.id)
        .maybeSingle();

      if (!existingCustomer && !customerCheckError) {
        logger.warn('ImprovedAdminLayout: Customer not found, inserting...');
        await supabase.from('customers').insert([
          {
            user_id: currentSession.user.id,
            name: currentSession.user.user_metadata?.full_name || 'Unknown',
            email: currentSession.user.email || null,
            phone: null,
            address: null,
          },
        ]);
      }

      logger.debug('ImprovedAdminLayout: Attempting to fetch profile for user ID:', currentSession.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentSession.user.id)
        .single();

      logger.debug('ImprovedAdminLayout: Profile data retrieved:', profile);
      logger.debug('ImprovedAdminLayout: Profile error:', profileError);

      if (profileError) {
        logger.error('ImprovedAdminLayout: Error fetching profile:', profileError.message);
        logger.warn('ImprovedAdminLayout: Profile fetch error, redirecting to /portal');
        navigate('/portal', { replace: true });
        setIsAdmin(false);
      } else if (!profile || !profile.is_admin) {
        logger.warn('ImprovedAdminLayout: User is NOT an admin. Redirecting to /portal');
        navigate('/portal', { replace: true });
        setIsAdmin(false);
      } else {
        logger.debug('ImprovedAdminLayout: User IS an admin. Granting access.');
        setIsAdmin(true);
      }
      setLoading(false);
      logger.debug('ImprovedAdminLayout: Auth/Admin Check Complete');
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      checkAuthAndAdminStatus(session);
      if (error) logger.error('Error getting initial session:', error.message);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.debug('ImprovedAdminLayout: Auth state changed event:', _event);
      checkAuthAndAdminStatus(session);
    });

    return () => {
      if (subscription) {
        logger.debug('ImprovedAdminLayout: Unsubscribing from auth state changes.');
        subscription.unsubscribe();
      }
    };
  }, [navigate, location.hash]);

  const handleLogout = async () => {
    logger.debug('ImprovedAdminLayout: Logging out...');
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const navigationLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    { to: '/admin/work-orders', icon: FileText, label: 'Work Orders' },
    { to: '/admin/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/admin/inventory', icon: Package, label: 'Inventory' },
    { to: '/admin/invoices', icon: FileBox, label: 'Invoices' },
    { to: '/admin/photos', icon: Image, label: 'Photos' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Access Denied. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-gray-800 rounded"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Tooltip key={link.to} content={link.label} position="right">
                <Link
                  to={link.to}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <GlobalSearch />
            </div>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />
          </div>
        </header>

        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
