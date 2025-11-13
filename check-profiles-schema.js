const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vbxrcqtjpcyhylanozgz.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
  // Check if profiles table exists and what columns it has
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error querying profiles:', error);
  } else {
    console.log('Profiles table schema (first row):', data);
  }
  
  // Try to get count
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  console.log('Total profiles:', count);
}

checkSchema();
