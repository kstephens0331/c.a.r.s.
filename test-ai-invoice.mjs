import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAIInvoice() {
  console.log('\n=== TESTING AI INVOICE EXTRACTION ===\n');

  // Step 1: Check if we can get a session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.log('❌ No active session. You need to be logged in.');
    console.log('Session error:', sessionError);
    return;
  }

  console.log('✅ Session found for user:', session.user.email);
  console.log('✅ Session token available');

  // Step 2: Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.log('❌ Error checking admin status:', profileError);
    return;
  }

  console.log('✅ User admin status:', profile?.is_admin);

  if (!profile?.is_admin) {
    console.log('❌ User is not an admin. AI invoice extraction requires admin access.');
    return;
  }

  // Step 3: Test edge function with a simple test image (1x1 pixel)
  console.log('\n📤 Testing edge function with test image...\n');

  // Create a minimal test image (1x1 red pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const edgeFunctionUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/process-invoice-ai`;

  console.log('Edge function URL:', edgeFunctionUrl);
  console.log('Auth token:', session.access_token.substring(0, 20) + '...');

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        imageBase64: testImageBase64,
        mimeType: 'image/png'
      })
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('\n✅ AI function called successfully!');
      console.log('Extracted data:', JSON.stringify(result, null, 2));
    } else {
      console.log('\n❌ AI function returned error');
      try {
        const errorJson = JSON.parse(responseText);
        console.log('Error:', errorJson);
      } catch {
        console.log('Raw error:', responseText);
      }
    }
  } catch (error) {
    console.log('\n❌ Failed to call edge function');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testAIInvoice().catch(console.error);
