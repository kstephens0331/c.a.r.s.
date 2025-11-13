import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnose() {
  console.log('\n=== CHECKING RLS STATE ===\n');
  
  // Query 1: Check RLS state on all tables
  const { data: rlsState, error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        t.tablename,
        c.relrowsecurity as rls_enabled,
        COUNT(p.policyname) as policy_count
      FROM pg_tables t
      JOIN pg_class c ON t.tablename = c.relname
      LEFT JOIN pg_policies p ON p.tablename = t.tablename
      WHERE t.schemaname = 'public'
        AND t.tablename IN (
          'customers', 'vehicles', 'work_orders', 'profiles'
        )
      GROUP BY t.tablename, c.relrowsecurity
      ORDER BY t.tablename;
    `
  });
  
  if (rlsError) {
    console.log('RLS state query error:', rlsError);
    
    // Try direct table query instead
    console.log('\nTrying direct customers query...');
    const { data, error, count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    console.log('Customers count query result:', { count, error });
    
    // Check policies
    console.log('\nChecking for pg_policies view...');
    const { data: policies, error: polError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'customers');
      
    console.log('Policies query:', { policies, error: polError });
  } else {
    console.log('RLS State:', rlsState);
  }
}

diagnose().catch(console.error);
