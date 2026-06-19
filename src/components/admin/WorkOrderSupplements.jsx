import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const STATUSES = ['pending', 'approved', 'denied'];

// Admin panel: supplements = additional damage/cost found mid-repair.
// Approved supplements add to what the customer owes (shown on their portal).
export default function WorkOrderSupplements({ workOrderId }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '' });
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    if (!workOrderId) return;
    const { data } = await supabase.from('work_order_supplements')
      .select('*').eq('work_order_id', workOrderId).order('created_at');
    setRows(data || []);
  }, [workOrderId]);

  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setErr('');
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || !(amount > 0)) { setErr('Enter a description and amount.'); return; }
    const { error } = await supabase.from('work_order_supplements')
      .insert({ work_order_id: workOrderId, description: form.description.trim(), amount });
    if (error) { setErr(error.message); return; }
    setForm({ description: '', amount: '' });
    load();
  };

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('work_order_supplements').update({ status }).eq('id', id);
    if (error) { setErr(error.message); return; }
    load();
  };

  const remove = async (id) => {
    const { error } = await supabase.from('work_order_supplements').delete().eq('id', id);
    if (error) { setErr(error.message); return; }
    load();
  };

  const approvedTotal = rows.filter(r => r.status === 'approved').reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mt-4">
      <h4 className="text-lg font-bold text-primary mb-3">Supplements (additional damage)</h4>
      {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
      {rows.length === 0 && <p className="text-xs text-gray-500 mb-2">No supplements added.</p>}
      {rows.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between text-sm border-b py-1 gap-2">
          <span className="flex-1 min-w-[140px]">{r.description}</span>
          <span className="font-semibold">{money(r.amount)}</span>
          <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="border rounded p-1 text-xs">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => remove(r.id)} className="text-brandRed text-xs hover:underline">remove</button>
        </div>
      ))}
      {approvedTotal > 0 && (
        <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
          <span>Approved supplements</span><span>{money(approvedTotal)}</span>
        </div>
      )}
      <form onSubmit={add} className="flex flex-wrap gap-2 mt-3 items-end">
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description (e.g. hidden frame damage)" className="border p-2 rounded text-sm flex-1 min-w-[180px]" />
        <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="amount" className="border p-2 rounded text-sm w-28" />
        <button type="submit" className="bg-primary text-white px-3 py-2 rounded text-sm font-semibold hover:bg-black">Add supplement</button>
      </form>
    </div>
  );
}
