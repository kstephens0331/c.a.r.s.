// supabase/functions/status-update-email/index.ts
// Updated to use Resend instead of Gmail
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  const { workOrderId, newStatus } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get work order with vehicle info
  const { data: workOrder, error: woError } = await supabase
    .from('work_orders')
    .select(`
      id,
      work_order_number,
      vehicle_id,
      vehicles (
        make,
        model,
        year,
        customer_id
      )
    `)
    .eq('id', workOrderId)
    .single()

  if (woError || !workOrder) {
    return new Response(JSON.stringify({ error: 'Work order not found' }), { status: 400 })
  }

  // Get customer details
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('email, name')
    .eq('id', workOrder.vehicles.customer_id)
    .single()

  if (customerError || !customer || !customer.email) {
    return new Response(JSON.stringify({ error: 'Customer not found or no email' }), { status: 400 })
  }

  // Send email using Resend API
  const resendApiKey = Deno.env.get('RESEND_API_KEY')

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'C.A.R.S Collision <onboarding@resend.dev>', // Using Resend's test domain
      to: customer.email,
      subject: `Repair Update: ${workOrder.vehicles.year} ${workOrder.vehicles.make} ${workOrder.vehicles.model}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #212121; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f5f5f5; padding: 30px; }
              .status-badge {
                background-color: #e53935;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                display: inline-block;
                font-size: 18px;
                font-weight: bold;
                margin: 20px 0;
              }
              .button {
                background-color: #e53935;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin: 20px 0;
              }
              .footer { text-align: center; color: #666; padding: 20px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>C.A.R.S Collision & Refinish Shop</h1>
              </div>
              <div class="content">
                <h2>Hello ${customer.name || 'Valued Customer'},</h2>
                <p>We wanted to update you on the status of your vehicle repair:</p>

                <p><strong>Vehicle:</strong> ${workOrder.vehicles.year} ${workOrder.vehicles.make} ${workOrder.vehicles.model}</p>
                <p><strong>Work Order:</strong> #${workOrder.work_order_number}</p>

                <div class="status-badge">
                  Status: ${newStatus}
                </div>

                <p>You can log in to your customer portal anytime to view detailed progress, photos, and documents:</p>

                <a href="https://collisionandrefinish.com/login" class="button">View Repair Portal</a>

                <p>If you have any questions, please don't hesitate to contact us.</p>

                <p>Thank you for choosing C.A.R.S Collision & Refinish!</p>
              </div>
              <div class="footer">
                <p>C.A.R.S Collision & Refinish Shop</p>
                <p>This is an automated notification. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })
  })

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text()
    console.error('Resend API error:', errorText)
    return new Response(JSON.stringify({ error: 'Failed to send email', details: errorText }), { status: 500 })
  }

  const emailData = await emailResponse.json()
  console.log('Email sent successfully:', emailData)

  return new Response(JSON.stringify({ success: true, emailId: emailData.id }), { status: 200 })
})
