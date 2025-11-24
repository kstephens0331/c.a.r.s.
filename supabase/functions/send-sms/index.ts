import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';

/**
 * Send SMS Edge Function
 * Sends SMS notifications via AWS SNS when work order status changes
 * Works alongside email notifications
 */
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is admin
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { workOrderId, phoneNumber } = await req.json();

    if (!workOrderId || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'workOrderId and phoneNumber are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch work order details
    const { data: workOrder, error: woError } = await supabaseClient
      .from('work_orders')
      .select(
        `
        *,
        vehicles (
          make,
          model,
          year,
          customers (
            name
          )
        )
      `
      )
      .eq('id', workOrderId)
      .single();

    if (woError || !workOrder) {
      return new Response(
        JSON.stringify({ error: 'Work order not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Format SMS message
    const statusMessages = {
      'Estimate Scheduled': 'estimate is scheduled',
      'Parts Ordered': 'parts have been ordered',
      'Parts Received': 'parts have been received',
      'Repairs Started': 'repairs have started',
      'Paint': 'is now in the paint shop',
      'Quality Check': 'is undergoing quality check',
      'Ready for Pickup': 'is ready for pickup! 🎉',
      'Complete': 'has been completed',
    };

    const statusMessage = statusMessages[workOrder.current_status] || 'has been updated';
    const vehicle = `${workOrder.vehicles?.year} ${workOrder.vehicles?.make} ${workOrder.vehicles?.model}`;
    const customerName = workOrder.vehicles?.customers?.name || 'Customer';

    const messageBody = `Hi ${customerName}! Your ${vehicle} (WO #${workOrder.work_order_number}) ${statusMessage}. Questions? Call us at (832) 844-5458. - C.A.R.S`;

    // Normalize phone number to E.164 format (+1XXXXXXXXXX)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Send SMS via AWS SNS
    const snsEndpoint = `https://sns.${AWS_REGION}.amazonaws.com/`;
    const now = new Date();
    const dateStamp = now.toISOString().split('T')[0].replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');

    // Create SNS request parameters
    const params = new URLSearchParams({
      Action: 'Publish',
      Message: messageBody,
      PhoneNumber: formattedPhone,
      Version: '2010-03-31',
    });

    // AWS Signature Version 4 signing
    const method = 'POST';
    const service = 'sns';
    const canonicalUri = '/';
    const canonicalQuerystring = '';
    const canonicalHeaders = `host:sns.${AWS_REGION}.amazonaws.com\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-date';
    const payloadHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(params.toString())
    ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${AWS_REGION}/${service}/aws4_request`;
    const canonicalRequestHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(canonicalRequest)
    ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

    // Generate signing key
    const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
      const kDate = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode('AWS4' + key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dateStamp)));

      const kRegion = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(kDate),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(regionName)));

      const kService = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(kRegion),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(serviceName)));

      const kSigning = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(kService),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode('aws4_request')));

      return new Uint8Array(kSigning);
    };

    const signingKey = await getSignatureKey(AWS_SECRET_ACCESS_KEY!, dateStamp, AWS_REGION, service);
    const signature = await crypto.subtle.importKey(
      'raw',
      signingKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(stringToSign)))
      .then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));

    const authorizationHeader = `${algorithm} Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Make SNS request
    const snsResponse = await fetch(snsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Amz-Date': amzDate,
        'Authorization': authorizationHeader,
      },
      body: params.toString(),
    });

    if (!snsResponse.ok) {
      const errorText = await snsResponse.text();
      console.error('AWS SNS error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS', details: errorText }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const snsData = await snsResponse.text();
    console.log('SMS sent successfully via AWS SNS:', snsData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully via AWS SNS',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
