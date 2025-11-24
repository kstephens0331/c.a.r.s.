import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs Component
 * Displays navigation breadcrumb trail for better UX
 */
const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) {
    return null;
  }

  // Format breadcrumb labels
  const formatLabel = (segment) => {
    // Handle special cases
    const specialCases = {
      'my-vehicles': 'My Vehicles',
      'my-documents': 'My Documents',
      'work-orders': 'Work Orders',
      'repair-photos': 'Repair Photos',
      'repair-updates': 'Repair Updates',
      'add-vehicle': 'Add Vehicle',
    };

    if (specialCases[segment]) {
      return specialCases[segment];
    }

    // Handle UUIDs or numeric IDs (don't display them)
    if (
      segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ||
      !isNaN(segment)
    ) {
      return 'Details';
    }

    // Capitalize first letter and replace hyphens with spaces
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home link */}
        <li>
          <Link
            to={pathnames[0] === 'admin' ? '/admin' : pathnames[0] === 'portal' ? '/portal' : '/'}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Home"
          >
            <Home size={16} />
          </Link>
        </li>

        {/* Breadcrumb trail */}
        {pathnames.map((segment, index) => {
          const path = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = formatLabel(segment);

          return (
            <li key={path} className="flex items-center space-x-2">
              <ChevronRight size={16} className="text-gray-400 dark:text-gray-600" />
              {isLast ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {label}
                </span>
              ) : (
                <Link
                  to={path}
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
