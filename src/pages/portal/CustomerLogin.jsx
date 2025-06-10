import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/portal');
    }
  };

const handleGoogleLogin = async () => {
  const redirectTo =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://c-a-r-s.vercel.app/'; // must match what's in Google Console

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo }
  });

  if (error) console.error('Google login error:', error.message);
};

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

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-primary text-white w-full py-3 rounded font-semibold hover:bg-black mb-4"
          >
            Log In
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-400 py-3 rounded font-semibold text-sm hover:bg-gray-100"
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
