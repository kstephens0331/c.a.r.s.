import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

// Superadmin-only: manage admin roles + view the audit trail.
export default function AdminUsers() {
  const [isSuperadmin, setIsSuperadmin] = useState(null); // null = loading
  const [profiles, setProfiles] = useState([]);
  const [audit, setAudit] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSuperadmin(false); return; }

    const { data: me } = await supabase
      .from('profiles').select('is_superadmin').eq('id', user.id).maybeSingle();
    const superadmin = !!me?.is_superadmin;
    setIsSuperadmin(superadmin);
    if (!superadmin) return;

    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name, email, is_admin, is_superadmin, created_at')
      .order('email');
    setProfiles(profs || []);

    const { data: logs } = await supabase
      .from('audit_log')
      .select('id, occurred_at, actor_email, action, table_name, row_id')
      .order('occurred_at', { ascending: false })
      .limit(100);
    setAudit(logs || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleAdmin = async (profile) => {
    setMessage(''); setError('');
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ is_admin: !profile.is_admin })
      .eq('id', profile.id);
    if (upErr) {
      setError(`Could not update role: ${upErr.message}`);
      return;
    }
    setMessage(`${profile.email} is now ${!profile.is_admin ? 'an admin' : 'a customer'}.`);
    load();
  };

  if (isSuperadmin === null) {
    return <div className="p-6"><p>Loading…</p></div>;
  }
  if (!isSuperadmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Admin Users</h1>
        <p className="mt-4 text-red-600">This area is restricted to superadmins.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Admin Users &amp; Audit | Admin</title><meta name="robots" content="noindex" /></Helmet>
      <div className="space-y-8 p-2 md:p-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Admin Users</h1>
          <p className="text-gray-600 mb-4">Grant or revoke admin access. Superadmin role is managed directly in the database.</p>
          {message && <p className="text-green-700 text-sm mb-3">{message}</p>}
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Role</th>
                  <th className="p-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{p.full_name || '—'}</td>
                    <td className="p-3 border-b">{p.email || '—'}</td>
                    <td className="p-3 border-b">
                      {p.is_superadmin ? 'Superadmin' : p.is_admin ? 'Admin' : 'Customer'}
                    </td>
                    <td className="p-3 border-b">
                      {p.is_superadmin ? (
                        <span className="text-gray-400">protected</span>
                      ) : (
                        <button
                          onClick={() => toggleAdmin(p)}
                          className="text-brandRed font-semibold hover:underline"
                        >
                          {p.is_admin ? 'Revoke admin' : 'Make admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-primary mb-3">Recent Activity (Audit Log)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border-b">When</th>
                  <th className="p-3 border-b">Who</th>
                  <th className="p-3 border-b">Action</th>
                  <th className="p-3 border-b">Table</th>
                  <th className="p-3 border-b">Record</th>
                </tr>
              </thead>
              <tbody>
                {audit.length === 0 && (
                  <tr><td className="p-3 border-b text-gray-500" colSpan={5}>No activity recorded yet.</td></tr>
                )}
                {audit.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b whitespace-nowrap">{new Date(a.occurred_at).toLocaleString()}</td>
                    <td className="p-3 border-b">{a.actor_email || 'system'}</td>
                    <td className="p-3 border-b">{a.action}</td>
                    <td className="p-3 border-b">{a.table_name}</td>
                    <td className="p-3 border-b font-mono text-xs">{a.row_id || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
