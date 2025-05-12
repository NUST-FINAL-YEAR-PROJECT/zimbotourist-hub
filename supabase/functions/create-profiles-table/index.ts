
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with Auth context of the user that called the function.
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Check if profiles table exists
    const { data: tablesData, error: tablesError } = await supabaseClient
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'profiles');

    if (tablesError) {
      console.error("Error checking for profiles table:", tablesError);
      throw tablesError;
    }

    // If profiles table doesn't exist, create it
    if (!tablesData || tablesData.length === 0) {
      // Create profiles table
      const { error: createError } = await supabaseClient.rpc('create_profiles_table_fn');
      
      if (createError) {
        console.error("Error creating profiles table:", createError);
        
        // Fallback: try direct SQL if RPC doesn't work
        const { error: sqlError } = await supabaseClient
          .query(`
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              email TEXT,
              username TEXT,
              role TEXT DEFAULT 'USER',
              avatar_url TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              is_locked BOOLEAN DEFAULT false
            );
            
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own profile"
              ON public.profiles
              FOR SELECT
              USING (auth.uid() = id);
            
            CREATE POLICY "Users can update their own profile"
              ON public.profiles
              FOR UPDATE
              USING (auth.uid() = id);
            
            CREATE POLICY "Admins can view all profiles"
              ON public.profiles
              FOR SELECT
              USING (
                EXISTS (
                  SELECT 1 FROM public.profiles
                  WHERE id = auth.uid() AND role = 'ADMIN'
                )
              );
            
            CREATE POLICY "Admins can update all profiles"
              ON public.profiles
              FOR UPDATE
              USING (
                EXISTS (
                  SELECT 1 FROM public.profiles
                  WHERE id = auth.uid() AND role = 'ADMIN'
                )
              );
          `);
        
        if (sqlError) {
          throw sqlError;
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Profiles table created successfully" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Profiles table already exists" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-profiles-table function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
