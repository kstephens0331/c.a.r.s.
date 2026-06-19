import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

const CATEGORIES = ['Body', 'Paint', 'Frame', 'Mechanical', 'Other'];
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

// Admin "Charges / Estimate" panel for a work order: labor lines + paint/materials
// + sublet + tax, with live totals. Parts come from work_order_parts. Reusable in
// both the work-order detail page and the customer-details work-order manager.
export default function WorkOrderCharges({ workOrderId }) {
  const [labor, setLabor] = useState([]);
  const [partsTotal, setPartsTotal] = useState(0);
  const [materials, setMaterials] = useState(0);
  const [sublet, setSublet] = useState(0);
  const [taxRate, setTaxRate] = useState(0.0825);
  const [defaultRate, setDefaultRate] = useState(55);
  const [newLine, setNewLine] = useState({ category: 'Body', hours: '', rate: '' });
  const [manualEnabled, setManualEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    if (!workOrderId) return;
    const [{ data: settings }, { data: wo }, { data: laborRows }, { data: parts }] = await Promise.all([
      supabase.from('shop_settings').select('default_labor_rate, tax_rate, manual_estimating_enabled').eq('id', 1).maybeSingle(),
      supabase.from('work_orders').select('paint_materials_total, sublet_total, tax_rate').eq('id', workOrderId).maybeSingle(),
      supabase.from('work_order_labor').select('*').eq('work_order_id', workOrderId).order('created_at'),
      supabase.from('work_order_parts').select('quantity_used, unit_price_at_time').eq('work_order_id', workOrderId),
    ]);
    if (settings) { setDefaultRate(Number(settings.default_labor_rate)); setManualEnabled(settings.manual_estimating_enabled !== false); }
    setLabor(laborRows || []);
    setMaterials(Number(wo?.paint_materials_total ?? 0));
    setSublet(Number(wo?.sublet_total ?? 0));
    setTaxRate(Number(wo?.tax_rate ?? settings?.tax_rate ?? 0.0825));
    setPartsTotal((parts || []).reduce((s, p) => s + Number(p.quantity_used) * Number(p.unit_price_at_time), 0));
    setNewLine((n) => ({ ...n, rate: n.rate || String(settings?.default_labor_rate ?? 55) }));
  }, [workOrderId]);

  useEffect(() => { load(); }, [load]);

  const laborTotal = labor.reduce((s, l) => s + Number(l.amount), 0);
  const subtotal = partsTotal + laborTotal + Number(materials || 0) + Number(sublet || 0);
  const tax = subtotal * Number(taxRate || 0);
  const total = subtotal + tax;

  const addLabor = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    const hours = parseFloat(newLine.hours), rate = parseFloat(newLine.rate);
    if (!(hours > 0) || !(rate > 0)) { setErr('Enter hours and rate.'); return; }
    const { error } = await supabase.from('work_order_labor').insert({ work_order_id: workOrderId, category: newLine.category, hours, rate });
    if (error) { setErr(error.message); return; }
    setNewLine({ category: 'Body', hours: '', rate: String(defaultRate) });
    load();
  };

  const removeLabor = async (id) => {
    const { error } = await supabase.from('work_order_labor').delete().eq('id', id);
    if (error) { setErr(error.message); return; }
    load();
  };

  const saveCharges = async () => {
    setSaving(true); setErr(''); setMsg('');
    const { error } = await supabase.from('work_orders').update({
      paint_materials_total: Number(materials || 0),
      sublet_total: Number(sublet || 0),
      tax_rate: Number(taxRate || 0),
      estimate_total: Number(total.toFixed(2)),
    }).eq('id', workOrderId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setMsg('Charges saved.');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mt-4">
      <h4 className="text-lg font-bold text-primary mb-3">Charges / Estimate</h4>
      {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
      {msg && <p className="text-green-700 text-sm mb-2">{msg}</p>}
      {!manualEnabled && (
        <p className="text-sm text-gray-600 italic mb-3">Estimating is synced from CCC ONE — manual entry is turned off.</p>
      )}

      {manualEnabled && (<>
      {/* Labor lines */}
      <div className="mb-3">
        <p className="font-semibold text-sm mb-1">Labor</p>
        {labor.length === 0 && <p className="text-xs text-gray-500 mb-1">No labor lines yet.</p>}
        {labor.map((l) => (
          <div key={l.id} className="flex items-center justify-between text-sm border-b py-1">
            <span>{l.category} — {Number(l.hours)} hr × {money(l.rate)}</span>
            <span className="flex items-center gap-3">
              <span className="font-semibold">{money(l.amount)}</span>
              <button onClick={() => removeLabor(l.id)} className="text-brandRed text-xs hover:underline">remove</button>
            </span>
          </div>
        ))}
        <form onSubmit={addLabor} className="flex flex-wrap gap-2 mt-2 items-end">
          <select value={newLine.category} onChange={(e) => setNewLine({ ...newLine, category: e.target.value })} className="border p-2 rounded text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" step="0.1" min="0" placeholder="hours" value={newLine.hours}
            onChange={(e) => setNewLine({ ...newLine, hours: e.target.value })} className="border p-2 rounded text-sm w-24" />
          <input type="number" step="0.01" min="0" placeholder="rate" value={newLine.rate}
            onChange={(e) => setNewLine({ ...newLine, rate: e.target.value })} className="border p-2 rounded text-sm w-24" />
          <button type="submit" className="bg-primary text-white px-3 py-2 rounded text-sm font-semibold hover:bg-black">Add labor</button>
        </form>
      </div>

      {/* Materials / sublet / tax */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
        <label className="flex flex-col">Paint &amp; materials
          <input type="number" step="0.01" min="0" value={materials} onChange={(e) => setMaterials(e.target.value)} className="border p-2 rounded mt-1" />
        </label>
        <label className="flex flex-col">Sublet
          <input type="number" step="0.01" min="0" value={sublet} onChange={(e) => setSublet(e.target.value)} className="border p-2 rounded mt-1" />
        </label>
        <label className="flex flex-col">Tax rate (e.g. 0.0825)
          <input type="number" step="0.0001" min="0" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="border p-2 rounded mt-1" />
        </label>
      </div>
      </>)}

      {/* Totals */}
      <div className="text-sm border-t pt-2 space-y-1">
        <div className="flex justify-between"><span>Parts</span><span>{money(partsTotal)}</span></div>
        <div className="flex justify-between"><span>Labor</span><span>{money(laborTotal)}</span></div>
        <div className="flex justify-between"><span>Paint &amp; materials</span><span>{money(materials)}</span></div>
        <div className="flex justify-between"><span>Sublet</span><span>{money(sublet)}</span></div>
        <div className="flex justify-between"><span>Tax ({(Number(taxRate) * 100).toFixed(2)}%)</span><span>{money(tax)}</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-1"><span>Estimated total</span><span>{money(total)}</span></div>
      </div>

      {manualEnabled && (
        <button onClick={saveCharges} disabled={saving} className="mt-3 bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-black disabled:opacity-50">
          {saving ? 'Saving…' : 'Save charges'}
        </button>
      )}
    </div>
  );
}
