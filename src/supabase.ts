import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseClientConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('http')
);

// Client-side Supabase instance for direct operations if configured
export const supabase = isSupabaseClientConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
