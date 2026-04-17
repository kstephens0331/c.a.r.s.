import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white overflow-x-hidden min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <Helmet>
        <title>Page Not Found | C.A.R.S. Collision & Refinish</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <h1 className="text-6xl font-bold text-brandRed mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-300 max-w-md text-center mb-8">
        The page you are looking for does not exist or has been moved. Let us help you find what you need.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="bg-brandRedDark text-white px-8 py-3 rounded hover:bg-red-700 transition font-semibold text-center"
        >
          Back to Home
        </Link>
        <Link
          to="/services"
          className="bg-white/10 text-white px-8 py-3 rounded hover:bg-white/20 transition font-semibold text-center"
        >
          View Services
        </Link>
        <Link
          to="/contact"
          className="bg-white/10 text-white px-8 py-3 rounded hover:bg-white/20 transition font-semibold text-center"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
