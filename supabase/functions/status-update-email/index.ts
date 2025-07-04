// supabase/functions/status-update-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import nodemailer from 'npm:nodemailer'

serve(async (req) => {
  const { workOrderId, newStatus } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get customer ID
  const { data: workOrder, error: woError } = await supabase
    .from('work_orders')
    .select('customer_id')
    .eq('id', workOrderId)
    .single()

  if (woError || !workOrder) {
    return new Response(JSON.stringify({ error: 'Work order not found' }), { status: 400 })
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('email, name')
    .eq('id', workOrder.customer_id)
    .single()

  if (customerError || !customer) {
    return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 400 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: Deno.env.get('GMAIL_USER'),
      pass: Deno.env.get('GMAIL_APP_PASSWORD'),
    },
  })

  await transporter.sendMail({
    from: `C.A.R.S Collision <${Deno.env.get('GMAIL_USER')}>`,
    to: customer.email,
    subject: 'Your Repair Status Has Been Updated',
    html: `
      <p>Hello ${customer.name || 'Valued Customer'},</p>
      <p>Your vehicle repair status has been updated to:</p>
      <h2>${newStatus}</h2>
      <p>You can log in any time to track progress:</p>
      <a href="https://collisionandrefinish.com/login">View Repair Portal</a>
      <br/><br/>
      <p>– C.A.R.S Collision & Refinish</p>   
    `
  })

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
