// Emails the customer a review request once their repair is complete/ready.
// Idempotent: sets work_orders.review_request_sent_at so it only sends once.
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
      .select('work_order_number, customer_id, review_request_sent_at, vehicles(make, model, year)')
      .eq('id', workOrderId)
      .single()
    if (!wo) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 })
    if (wo.review_request_sent_at) return new Response(JSON.stringify({ skipped: 'already sent' }), { headers: { 'Content-Type': 'application/json' } })

    const { data: customer } = await supabase
      .from('customers').select('name, email').eq('id', wo.customer_id).single()
    if (!customer?.email) return new Response(JSON.stringify({ error: 'no customer email' }), { status: 400 })

    const { data: settings } = await supabase.from('shop_settings').select('review_url').eq('id', 1).maybeSingle()
    const reviewUrl = settings?.review_url || 'https://www.google.com/search?q=C.A.R.S+Collision+and+Refinish+Shop+Reviews'
    const v = wo.vehicles || {}
    const vehicle = `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim()

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'C.A.R.S Collision <noreply@carscollisionandrefinishshop.com>',
        to: customer.email,
        subject: `Thank you from C.A.R.S Collision & Refinish Shop`,
        html: `<p>Hi ${customer.name || 'there'},</p>
               <p>Your ${vehicle} (Work Order #${wo.work_order_number}) is ready, and we hope you're thrilled with the result.</p>
               <p>If we earned it, a quick review means the world to a veteran-owned shop:</p>
               <p><a href="${reviewUrl}" style="background:#b91c1c;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">Leave us a review</a></p>
               <p>Thank you for trusting us with your vehicle.<br/>— The C.A.R.S team</p>`,
      }),
    })
    if (!r.ok) {
      const t = await r.text()
      return new Response(JSON.stringify({ error: 'email failed', details: t }), { status: 502 })
    }

    await supabase.from('work_orders').update({ review_request_sent_at: new Date().toISOString() }).eq('id', workOrderId)
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 })
  }
})
