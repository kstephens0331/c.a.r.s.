import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    return new Response('OK', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // ✅ or specify your domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { customerId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data, error } = await supabaseClient
      .from('vehicles')
      .select('id, make, model, year, color, vin, license_plate')
      .eq('customer_id', customerId)

    if (error) throw new Error(error.message)

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // ✅ CORS header
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // ✅ CORS header
      },
    })
  }
})