
/// <reference types="vite/client" />

interface Window {
  env?: {
    VITE_SUPABASE_FUNCTIONS_URL?: string;
    [key: string]: any;
  }
}
