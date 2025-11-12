import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient';
import { validateEmail, validateRequired } from '../../utils/validation';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in (from OAuth redirect or existing session)
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setLoading(true);

        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_admin) {
          navigate('/admin');
        } else {
          navigate('/portal');
        }
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  const handleLogin = async (e) => {
  e.preventDefault();
  setError(null);
  setFieldErrors({});

  // Validate inputs
  const emailValidation = validateEmail(email);
  const passwordValidation = validateRequired(password, 'Password');

  if (!emailValidation.isValid || !passwordValidation.isValid) {
    setFieldErrors({
      email: emailValidation.error,
      password: passwordValidation.error
    });
    return;
  }

  setLoading(true);

  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) {
    setError(loginError.message);
    setLoading(false);
    return;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Profile lookup failed:', profileError.message);
    setError('Unable to verify user role.');
    setLoading(false);
    return;
  }

  // Redirect based on admin status
  if (profile?.is_admin) {
    navigate('/admin');
  } else {
    navigate('/portal');
  }
};

const handleGoogleLogin = async () => {
  // Redirect to login page after OAuth, where we'll check admin status
  const redirectTo =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5173/login'
      : 'https://c-a-r-s.vercel.app/login';

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo }
  });

  if (error) {
    console.error('Google login error:', error.message);
    setError('Google sign-in failed. Please try again.');
  }
};
  // Show loading state while checking session/redirecting
  if (loading) {
    return (
      <>
        <Helmet>
          <title>Customer Login | C.A.R.S Collision & Refinish Shop</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-accent px-4">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandRed mx-auto mb-4"></div>
            <p className="text-gray-700">Redirecting...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Login | C.A.R.S Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Secure login for customers to track repair progress and updates from Collision & Refinish Shop."
        />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-accent px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-primary text-center">Customer Login</h2>

          {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-3 border rounded text-gray-900 ${fieldErrors.email ? 'border-red-500' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-3 border rounded text-gray-900 ${fieldErrors.password ? 'border-red-500' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white w-full py-3 rounded font-semibold hover:bg-black mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Log In'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-gray-400 py-3 rounded font-semibold text-sm text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in with Google
          </button>

          <p className="text-sm text-center mt-6">
            Don’t have an account?{' '}
            <Link to="/register" className="text-brandRed font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
