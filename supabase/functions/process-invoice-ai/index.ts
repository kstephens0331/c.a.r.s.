// ============================================================================
// Edge Function: Process Invoice with Claude AI (Anthropic)
// ============================================================================
// This function securely calls the Claude API to extract invoice data
// The API key is stored in Supabase secrets, not exposed in client code
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // ========================================================================
    // SECURITY: Verify Admin Authorization
    // ========================================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // ========================================================================
    // PROCESS REQUEST: Extract image data
    // ========================================================================
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing image data' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // ========================================================================
    // CALL CLAUDE API: Extract invoice data
    // ========================================================================
    const apiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!apiKey) {
      console.error('CLAUDE_API_KEY not set in Supabase secrets');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Determine media type for Claude API
    const mediaType = mimeType || 'image/jpeg';
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!supportedTypes.includes(mediaType)) {
      return new Response(
        JSON.stringify({
          error: 'Unsupported image type. Please use JPEG, PNG, GIF, or WebP.'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const claudeUrl = 'https://api.anthropic.com/v1/messages';

    const claudeRequest = {
      model: 'claude-opus-4-1-20250805',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `You are an expert invoice data extraction assistant. Analyze this invoice image systematically.

STEP 1 - LOCATE THE LINE ITEMS TABLE:
- Find the table with columns like: ITEM#, PART#, QUANT, ORDER, DESCRIPTION, PRICE, COST, etc.
- This table contains the parts/products purchased
- Each row is one line item

STEP 2 - IDENTIFY TABLE COLUMNS:
Scan the table headers to locate these columns:
- ITEM# / PART# / SKU → This is the part number (may contain letters and numbers like M1000912V)
- DESCRIPTION / VENDOR NUMBERS → This is the product description
- QUANT / ORDER / QTY → This is the quantity ordered
- YOUR COST / COST / NET / PRICE → This is the unit price (USE THIS!)
- LIST PRICE / MSRP / RETAIL → Ignore these, they are suggested retail prices

STEP 3 - EXTRACT EACH ROW:
For EVERY row in the line items table, extract:
1. Part Number from the ITEM# or PART# column (like M1000912V, M1241366V)
2. Description from the DESCRIPTION or VENDOR NUMBERS column
3. Quantity from the QUANT or ORDER column (usually 1)
4. Unit Price from the YOUR COST or COST column (NOT from LIST PRICE)

CRITICAL PRICE EXTRACTION RULES:
- If you see multiple price columns, use "YOUR COST" or "COST" (actual price paid)
- NEVER use "LIST PRICE" or "MSRP" (those are not what was charged)
- The correct price is usually the LOWER price when multiple prices exist
- Remove $ and commas from all prices
- If a price is $41.00, return 41.00 (number, not string)

STEP 4 - HEADER INFORMATION:
- Invoice Number: Look for "SALES ORDER", "ORDER#", "INVOICE#" at the top
- Supplier: Company name at the very top of the invoice
- Invoice Date: Look for "DATE:" field near the top
- Total Amount: Look for "TOTAL" at the bottom (after tax/shipping)

Return ONLY this JSON (no explanation, no markdown):

{
  "invoiceNumber": "string or null",
  "supplier": "string or null",
  "invoiceDate": "YYYY-MM-DD or null",
  "totalAmount": number or null,
  "lineItems": [
    {
      "partNumber": "string or null",
      "description": "string or null",
      "quantity": number or null,
      "unitPrice": number or null
    }
  ]
}

EXAMPLE:
If the table shows:
ITEM# M1000912V | QUANT 1 | DESCRIPTION Front Bumper | LIST PRICE $99.00 | YOUR COST $41.00

Extract as:
{"partNumber": "M1000912V", "description": "Front Bumper", "quantity": 1, "unitPrice": 41.00}`,
            },
          ],
        },
      ],
    };

    const claudeResponse = await fetch(claudeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(claudeRequest),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to process invoice image',
          details: errorText,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const claudeData = await claudeResponse.json();

    // ========================================================================
    // PARSE RESPONSE: Extract JSON from Claude's response
    // ========================================================================
    let extractedData;
    try {
      // Claude returns data in content[0].text
      const responseText = claudeData.content?.[0]?.text || '';

      // Try to parse the JSON from the response
      // Remove markdown code blocks if present
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      extractedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return new Response(
        JSON.stringify({
          error: 'Failed to parse AI response',
          rawResponse: claudeData,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================
    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
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
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
