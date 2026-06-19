import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

const STATUSES = ['requested', 'scheduled', 'declined'];
const TYPE_LABEL = { estimate: 'Estimate / quote', dropoff: 'Vehicle drop-off', other: 'Other' };

export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('requested');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    let q = supabase.from('appointment_requests')
      .select('id, request_type, preferred_date, notes, status, created_at, customers(name, email, phone), vehicles(year, make, model)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data, error } = await q;
    if (error) { setErr(error.message); return; }
    setRows(data || []);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('appointment_requests').update({ status }).eq('id', id);
    if (error) { setErr(error.message); return; }
    load();
  };

  return (
    <>
      <Helmet><title>Appointment Requests | Admin</title><meta name="robots" content="noindex" /></Helmet>
      <div className="p-2 md:p-4">
        <h1 className="text-3xl font-bold text-primary mb-1">Appointment Requests</h1>
        <p className="text-gray-600 mb-4">Customer-submitted requests for estimates and drop-offs.</p>
        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

        <div className="flex gap-2 mb-4">
          {['requested', 'scheduled', 'declined', 'all'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm font-semibold ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="text-gray-500">No requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border-b">Requested</th>
                  <th className="p-3 border-b">Customer</th>
                  <th className="p-3 border-b">Type</th>
                  <th className="p-3 border-b">Preferred</th>
                  <th className="p-3 border-b">Vehicle</th>
                  <th className="p-3 border-b">Notes</th>
                  <th className="p-3 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 align-top">
                    <td className="p-3 border-b whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 border-b">
                      <div className="font-semibold">{r.customers?.name || '—'}</div>
                      <div className="text-xs text-gray-500">{r.customers?.phone || r.customers?.email || ''}</div>
                    </td>
                    <td className="p-3 border-b">{TYPE_LABEL[r.request_type] || r.request_type}</td>
                    <td className="p-3 border-b whitespace-nowrap">{r.preferred_date ? new Date(r.preferred_date).toLocaleDateString() : '—'}</td>
                    <td className="p-3 border-b">{r.vehicles ? `${r.vehicles.year} ${r.vehicles.make} ${r.vehicles.model}` : '—'}</td>
                    <td className="p-3 border-b max-w-[200px]">{r.notes || '—'}</td>
                    <td className="p-3 border-b">
                      <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="border rounded p-1 text-xs">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
