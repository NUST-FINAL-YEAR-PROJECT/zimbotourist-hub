
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gduzxexxpbibimtiycur.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkdXp4ZXh4cGJpYmltdGl5Y3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MDA3ODcsImV4cCI6MjA1MjA3Njc4N30.sLmnRqkr3j8DchJaOOF3eNvbpl6db5tplg7dUOX6Fqw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: localStorage
  }
});
