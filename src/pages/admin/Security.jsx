import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

// Admin self-service MFA (TOTP) enrollment + management.
export default function Security() {
  const [factors, setFactors] = useState([]);
  const [enroll, setEnroll] = useState(null); // { factorId, qr, secret }
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFactors = useCallback(async () => {
    const { data, error: e } = await supabase.auth.mfa.listFactors();
    if (e) { setError(e.message); return; }
    setFactors((data?.totp || []).filter((f) => f.status === 'verified'));
  }, []);

  useEffect(() => { loadFactors(); }, [loadFactors]);

  const startEnroll = async () => {
    setError(''); setMessage(''); setBusy(true);
    const { data, error: e } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `authenticator-${Date.now()}` });
    setBusy(false);
    if (e) { setError(e.message); return; }
    setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnroll = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
    if (chErr) { setBusy(false); setError(chErr.message); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId: enroll.factorId, challengeId: ch.id, code: code.trim() });
    setBusy(false);
    if (vErr) { setError(`Could not verify code: ${vErr.message}`); return; }
    setMessage('Authenticator enabled. You will be asked for a code at your next login.');
    setEnroll(null); setCode('');
    loadFactors();
  };

  const removeFactor = async (factorId) => {
    setError(''); setMessage('');
    const { error: e } = await supabase.auth.mfa.unenroll({ factorId });
    if (e) { setError(e.message); return; }
    setMessage('Authenticator removed.');
    loadFactors();
  };

  return (
    <>
      <Helmet><title>Security | Admin</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-xl space-y-6 p-2 md:p-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Security</h1>
          <p className="text-gray-600">Protect your admin account with two-factor authentication (TOTP).</p>
        </div>

        {message && <p className="text-green-700 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Authenticator app</h2>
          {factors.length > 0 ? (
            <div className="space-y-3">
              <p className="text-green-700 text-sm">✓ Two-factor authentication is enabled.</p>
              {factors.map((f) => (
                <div key={f.id} className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-gray-700">{f.friendly_name || 'Authenticator'}</span>
                  <button onClick={() => removeFactor(f.id)} className="text-brandRed text-sm font-semibold hover:underline">Remove</button>
                </div>
              ))}
            </div>
          ) : enroll ? (
            <form onSubmit={verifyEnroll} className="space-y-4">
              <p className="text-sm text-gray-700">Scan this QR code with Google Authenticator, 1Password, Authy, etc. — then enter the 6-digit code to confirm.</p>
              <div className="w-48 h-48 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: enroll.qr }} />
              <p className="text-xs text-gray-500 break-all">Or enter this key manually: <span className="font-mono">{enroll.secret}</span></p>
              <input
                inputMode="numeric" autoComplete="one-time-code" placeholder="123456"
                className="w-40 p-3 border rounded text-gray-900 tracking-widest text-center"
                value={code} onChange={(ev) => setCode(ev.target.value)} required
              />
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-black disabled:opacity-50">
                  {busy ? 'Verifying…' : 'Verify & enable'}
                </button>
                <button type="button" onClick={() => { setEnroll(null); setCode(''); }} className="px-4 py-2 rounded border font-semibold">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={startEnroll} disabled={busy} className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-black disabled:opacity-50">
              {busy ? 'Starting…' : 'Set up authenticator app'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
