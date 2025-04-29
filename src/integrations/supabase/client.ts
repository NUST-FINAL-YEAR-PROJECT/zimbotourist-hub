
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

// Add this helper function to check if Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    console.log("Checking Supabase connection...");
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Unexpected error checking Supabase connection:', err);
    return false;
  }
};

// Fixed the fetchSupabaseData function to use proper typing
export const fetchSupabaseData = async <T extends keyof Database['public']['Tables']>(table: T, select = "*") => {
  console.log(`Fetching data from ${table} table...`);
  const { data, error } = await supabase.from(table).select(select);
  
  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return null;
  }
  
  console.log(`${table} data:`, data);
  return data;
};
