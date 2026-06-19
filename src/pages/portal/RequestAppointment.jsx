import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

const TYPES = [
  { value: 'estimate', label: 'Estimate / quote' },
  { value: 'dropoff', label: 'Vehicle drop-off' },
  { value: 'other', label: 'Other' },
];

export default function RequestAppointment() {
  const [customerId, setCustomerId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ request_type: 'estimate', preferred_date: '', vehicle_id: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadRequests = async (cid) => {
    const { data } = await supabase.from('appointment_requests')
      .select('id, request_type, preferred_date, notes, status, created_at')
      .eq('customer_id', cid).order('created_at', { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).maybeSingle();
      if (!customer) return;
      setCustomerId(customer.id);
      const { data: v } = await supabase.from('vehicles').select('id, year, make, model').eq('customer_id', customer.id);
      setVehicles(v || []);
      loadRequests(customer.id);
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg(''); setSaving(true);
    const { error } = await supabase.from('appointment_requests').insert({
      customer_id: customerId,
      request_type: form.request_type,
      preferred_date: form.preferred_date || null,
      vehicle_id: form.vehicle_id || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setMsg('Request sent — the shop will confirm a time with you.');
    setForm({ request_type: 'estimate', preferred_date: '', vehicle_id: '', notes: '' });
    loadRequests(customerId);
  };

  const input = 'border p-2 rounded w-full';
  return (
    <>
      <Helmet><title>Request an Appointment | C.A.R.S Collision & Refinish Shop</title></Helmet>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-primary mb-2">Request an Appointment</h1>
        <p className="text-gray-600 mb-6">Tell us what you need and a preferred day — we'll confirm a time.</p>

        {msg && <p className="text-green-700 mb-3">{msg}</p>}
        {err && <p className="text-red-600 mb-3">{err}</p>}

        <form onSubmit={submit} className="space-y-4 bg-white border rounded-lg p-5 shadow-sm">
          <label className="block text-sm font-semibold">What do you need?
            <select className={`${input} mt-1`} value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Preferred date
            <input type="date" className={`${input} mt-1`} value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
          </label>
          {vehicles.length > 0 && (
            <label className="block text-sm font-semibold">Vehicle (optional)
              <select className={`${input} mt-1`} value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">— select —</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>)}
              </select>
            </label>
          )}
          <label className="block text-sm font-semibold">Notes
            <textarea className={`${input} mt-1`} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything we should know?" />
          </label>
          <button type="submit" disabled={saving || !customerId} className="bg-primary text-white px-5 py-2 rounded font-semibold hover:bg-black disabled:opacity-50">
            {saving ? 'Sending…' : 'Send request'}
          </button>
        </form>

        {requests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-primary mb-3">Your requests</h2>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex justify-between items-center bg-white border rounded p-3 text-sm">
                  <span>{TYPES.find(t => t.value === r.request_type)?.label || r.request_type}{r.preferred_date ? ` · ${new Date(r.preferred_date).toLocaleDateString()}` : ''}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status === 'scheduled' ? 'bg-green-100 text-green-800' : r.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
