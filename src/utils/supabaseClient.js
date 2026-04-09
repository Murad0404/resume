import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only initialize if we have a valid URL (begins with http) and a key
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey;

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isConfigured && import.meta.env.DEV) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Visitor tracking is disabled.');
}
