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
              text: `You are an invoice data extraction assistant. Carefully analyze this invoice image and extract ALL information accurately.

CRITICAL: For line items, you MUST extract:
1. Part numbers (ITEM#, PART#, SKU, vendor part number, model number)
2. Descriptions (full product description text)
3. Quantities (QUANT, ORDER, Qty - the number ordered)
4. Unit prices - READ CAREFULLY:
   - If there are multiple price columns (LIST PRICE, YOUR COST, PRICE, COST, etc.)
   - ALWAYS use "YOUR COST" or "COST" or "NET PRICE" (the actual price paid)
   - DO NOT use "LIST PRICE" or "MSRP" (those are suggested retail)
   - If only one price column exists, use that price
   - The correct price is typically the lower price when multiple columns exist

IMPORTANT PRICING LOGIC:
- Look for columns labeled: "YOUR COST", "COST", "NET", "PRICE", "UNIT PRICE", "EACH"
- Ignore columns labeled: "LIST PRICE", "MSRP", "RETAIL", "SUGGESTED"
- For each line item, find the price in the "your cost" or actual cost column
- Remove all $ symbols and commas from prices
- Prices should match what was actually charged (not suggested retail)
- If quantity is missing, assume 1

Return ONLY this JSON structure with NO additional text:

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

VALIDATION RULES:
- Invoice date: Convert to YYYY-MM-DD format (from any format shown)
- All prices: Numbers only (remove $, commas)
- Extract EVERY line item from the invoice table
- Part numbers: Include vendor/manufacturer part numbers, model numbers
- Descriptions: Full product description including all details shown
- Unit prices: Use actual cost paid (YOUR COST column), not list price`,
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
