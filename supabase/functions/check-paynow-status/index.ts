
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"

// Initialize Paynow (using version compatible with Deno)
import Paynow from "npm:paynow";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Your Paynow integration details need to be set as secrets in Supabase
const paynowIntegrationId = Deno.env.get("PAYNOW_INTEGRATION_ID") || "";
const paynowIntegrationKey = Deno.env.get("PAYNOW_INTEGRATION_KEY") || "";

// Initialize Paynow
const paynow = new Paynow(paynowIntegrationId, paynowIntegrationKey);

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { pollUrl } = await req.json();

    if (!pollUrl) {
      throw new Error("Missing poll URL");
    }

    // Check payment status
    const status = await paynow.pollTransaction(pollUrl);
    
    return new Response(
      JSON.stringify({
        paid: status.paid,
        status: status.status,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    
    return new Response(
      JSON.stringify({
        paid: false,
        status: "error",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
