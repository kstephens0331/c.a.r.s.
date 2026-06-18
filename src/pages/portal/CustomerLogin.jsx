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
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const navigate = useNavigate();

  // Returns true if the session still needs a second factor (aal2) to continue.
  const needsMfa = async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
  };

  const redirectByRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_superadmin')
      .eq('id', user.id)
      .maybeSingle();
    navigate(profile?.is_admin || profile?.is_superadmin ? '/admin' : '/portal');
  };

  // Already logged in (existing session / OAuth redirect): challenge MFA if needed, else route.
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      if (await needsMfa()) { setMfaRequired(true); return; }
      setLoading(true);
      await redirectByRole();
    };
    checkUserAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // If the account has two-factor enabled, challenge for a code before routing.
  if (await needsMfa()) {
    setMfaRequired(true);
    setLoading(false);
    return;
  }

  await redirectByRole();
};

const submitMfa = async (e) => {
  e.preventDefault();
  setMfaError('');
  setLoading(true);
  const { data: factors, error: lfErr } = await supabase.auth.mfa.listFactors();
  if (lfErr) { setMfaError(lfErr.message); setLoading(false); return; }
  const totp = factors?.totp?.[0];
  if (!totp) { setMfaError('No authenticator is set up for this account.'); setLoading(false); return; }
  const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
  if (chErr) { setMfaError(chErr.message); setLoading(false); return; }
  const { error: vErr } = await supabase.auth.mfa.verify({ factorId: totp.id, challengeId: ch.id, code: mfaCode.trim() });
  if (vErr) { setMfaError('Invalid code. Please try again.'); setLoading(false); return; }
  await redirectByRole();
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
          <meta name="robots" content="noindex, nofollow" />
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
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="Secure login for customers to track repair progress and updates from C.A.R.S Collision & Refinish Shop."
        />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-accent px-4">
        {mfaRequired ? (
        <form onSubmit={submitMfa} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-primary text-center">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">Enter the 6-digit code from your authenticator app.</p>
          {mfaError && <p className="text-red-600 mb-4 text-sm">{mfaError}</p>}
          <input
            inputMode="numeric" autoComplete="one-time-code" placeholder="123456" autoFocus
            className="w-full p-3 border rounded text-gray-900 tracking-widest text-center mb-4"
            value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} required
          />
          <button type="submit" disabled={loading}
            className="bg-primary text-white w-full py-3 rounded font-semibold hover:bg-black disabled:opacity-50">
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
        ) : (
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

          <p className="text-sm text-center mt-4">
            <Link to="/reset-password" className="text-brandRed font-semibold hover:underline">
              Forgot password?
            </Link>
          </p>

          <p className="text-sm text-center mt-2">
            Don’t have an account?{' '}
            <Link to="/register" className="text-brandRed font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </form>
        )}
      </div>
    </>
  );
}
