import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient';

// Handles two modes:
//  - 'request': no active session -> ask for email, send a reset link
//  - 'update' : arrived from a recovery link (session present) -> set a new password
export default function ResetPassword() {
  const [mode, setMode] = useState('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase parses the recovery token from the URL and emits PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('update');
    });
    // Fallbacks: a recovery hash in the URL, or an already-established session.
    (async () => {
      if ((window.location.hash || '').includes('type=recovery')) {
        setMode('update');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setMode('update');
    })();
    return () => subscription.unsubscribe();
  }, []);

  const sendReset = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage('If an account exists for that email, a password reset link is on its way.');
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }
    setMessage('Password updated. Redirecting to login…');
    await supabase.auth.signOut();
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | C.A.R.S Collision & Refinish Shop</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-accent px-4">
        <form
          onSubmit={mode === 'update' ? updatePassword : sendReset}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-primary text-center">
            {mode === 'update' ? 'Set a New Password' : 'Reset Your Password'}
          </h2>

          {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
          {message && <p className="text-green-700 mb-4 text-sm">{message}</p>}

          {mode === 'update' ? (
            <>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full p-3 border rounded text-gray-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full p-3 border rounded text-gray-900"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="mb-6">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white w-full py-3 rounded font-semibold hover:bg-black mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Please wait…'
              : mode === 'update'
                ? 'Update Password'
                : 'Send Reset Link'}
          </button>

          <p className="text-sm text-center mt-2">
            <Link to="/login" className="text-brandRed font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
