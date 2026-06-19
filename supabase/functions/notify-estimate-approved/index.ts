// Emails the shop when a customer approves an estimate.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  try {
    const { workOrderId } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: wo } = await supabase
      .from('work_orders')
      .select('work_order_number, estimate_total, vehicle_id, customer_id, vehicles(make, model, year)')
      .eq('id', workOrderId)
      .single()
    if (!wo) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 })

    const { data: customer } = await supabase
      .from('customers').select('name, email').eq('id', wo.customer_id).single()

    const shopTo = Deno.env.get('SHOP_NOTIFY_EMAIL') || 'carscollisionhouston@gmail.com'
    const v = wo.vehicles || {}
    const vehicle = `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim()
    const total = wo.estimate_total != null ? `$${Number(wo.estimate_total).toFixed(2)}` : 'N/A'

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'C.A.R.S Collision <noreply@carscollisionandrefinishshop.com>',
        to: shopTo,
        subject: `Estimate approved — WO #${wo.work_order_number} (${vehicle})`,
        html: `<p><strong>${customer?.name || 'A customer'}</strong> approved the estimate for <strong>Work Order #${wo.work_order_number}</strong> (${vehicle}).</p>
               <p>Estimated total: <strong>${total}</strong></p>
               <p>Customer: ${customer?.email || 'n/a'}</p>`,
      }),
    })
    if (!r.ok) {
      const t = await r.text()
      return new Response(JSON.stringify({ error: 'email failed', details: t }), { status: 502 })
    }
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 })
  }
})
