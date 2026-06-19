import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

// Admin panel: insurance/claim details + drop-off/pickup scheduling for a work order.
// Shown regardless of the in-platform-estimating switch (these aren't part of the quote).
export default function WorkOrderInsurance({ workOrderId }) {
  const [f, setF] = useState({
    is_insurance: false, insurance_company: '', claim_number: '', policy_number: '',
    adjuster_name: '', adjuster_phone: '', deductible: '', dropoff_date: '', pickup_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    if (!workOrderId) return;
    const { data } = await supabase.from('work_orders')
      .select('is_insurance, insurance_company, claim_number, policy_number, adjuster_name, adjuster_phone, deductible, dropoff_date, pickup_date')
      .eq('id', workOrderId).maybeSingle();
    if (data) setF({
      is_insurance: !!data.is_insurance,
      insurance_company: data.insurance_company || '', claim_number: data.claim_number || '',
      policy_number: data.policy_number || '', adjuster_name: data.adjuster_name || '',
      adjuster_phone: data.adjuster_phone || '', deductible: data.deductible ?? '',
      dropoff_date: data.dropoff_date || '', pickup_date: data.pickup_date || '',
    });
  }, [workOrderId]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async () => {
    setSaving(true); setErr(''); setMsg('');
    const { error } = await supabase.from('work_orders').update({
      is_insurance: f.is_insurance,
      insurance_company: f.insurance_company || null,
      claim_number: f.claim_number || null,
      policy_number: f.policy_number || null,
      adjuster_name: f.adjuster_name || null,
      adjuster_phone: f.adjuster_phone || null,
      deductible: f.deductible === '' ? null : Number(f.deductible),
      dropoff_date: f.dropoff_date || null,
      pickup_date: f.pickup_date || null,
    }).eq('id', workOrderId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setMsg('Saved.');
    setTimeout(() => setMsg(''), 2500);
  };

  const input = 'border p-2 rounded text-sm w-full';
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mt-4">
      <h4 className="text-lg font-bold text-primary mb-3">Insurance &amp; Scheduling</h4>
      {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
      {msg && <p className="text-green-700 text-sm mb-2">{msg}</p>}
      <label className="flex items-center gap-2 text-sm mb-3">
        <input type="checkbox" checked={f.is_insurance} onChange={set('is_insurance')} /> Insurance claim
      </label>
      {f.is_insurance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input className={input} placeholder="Insurance company" value={f.insurance_company} onChange={set('insurance_company')} />
          <input className={input} placeholder="Claim #" value={f.claim_number} onChange={set('claim_number')} />
          <input className={input} placeholder="Policy #" value={f.policy_number} onChange={set('policy_number')} />
          <input className={input} placeholder="Adjuster name" value={f.adjuster_name} onChange={set('adjuster_name')} />
          <input className={input} placeholder="Adjuster phone" value={f.adjuster_phone} onChange={set('adjuster_phone')} />
          <input className={input} type="number" step="0.01" min="0" placeholder="Deductible ($)" value={f.deductible} onChange={set('deductible')} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
        <label className="flex flex-col">Drop-off date
          <input className={input} type="date" value={f.dropoff_date} onChange={set('dropoff_date')} />
        </label>
        <label className="flex flex-col">Pickup date
          <input className={input} type="date" value={f.pickup_date} onChange={set('pickup_date')} />
        </label>
      </div>
      <button onClick={save} disabled={saving} className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-black disabled:opacity-50">
        {saving ? 'Saving…' : 'Save insurance & scheduling'}
      </button>
    </div>
  );
}
