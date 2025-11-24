import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please check your .env file and ensure VITE_SUPABASE_URL is set.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please check your .env file and ensure VITE_SUPABASE_ANON_KEY is set.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". ` +
    'Must be a valid URL (e.g., https://your-project.supabase.co)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);