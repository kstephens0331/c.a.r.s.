// src/pages/portal/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient'; // CORRECTED PATH
import { validateEmail, validatePassword } from '../../utils/validation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setFieldErrors({
        email: emailValidation.error,
        password: passwordValidation.error
      });
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/portal');
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/portal` },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Create your customer account to track vehicle repairs and receive real-time updates."
        />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-accent px-4">
        <form
          onSubmit={handleRegister}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-primary text-center">Create Your Account</h2>

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
              placeholder="Password (min 8 characters, uppercase, lowercase, numbers)"
              className={`w-full p-3 border rounded text-gray-900 ${fieldErrors.password ? 'border-red-500' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            className="bg-primary text-white w-full py-3 rounded font-semibold hover:bg-black mb-4"
          >
            Register
          </button>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full border border-gray-400 py-3 rounded font-semibold text-sm text-gray-900 hover:bg-gray-100"
          >
            Sign up with Google
          </button>

          <p className="text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brandRed font-semibold hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}