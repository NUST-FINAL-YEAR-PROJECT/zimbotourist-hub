
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
    // Parse request body
    const { email, phone, amount, reference, items, returnUrl } = await req.json();

    // Create payment
    const payment = paynow.createPayment(reference, email);
    
    // Set return URLs (must be absolute URLs)
    paynow.resultUrl = returnUrl + "?reference=" + reference;
    paynow.returnUrl = returnUrl + "?reference=" + reference;
    
    // Add items
    if (items && items.length > 0) {
      items.forEach((item: { name: string, amount: number }) => {
        payment.add(item.name, item.amount);
      });
    } else {
      payment.add("Zimbabwe Travel Booking", amount);
    }

    // Send payment to Paynow
    const response = await paynow.send(payment);
    
    if (response.success) {
      return new Response(
        JSON.stringify({
          success: true,
          hash: response.hash,
          redirectUrl: response.redirectUrl,
          pollUrl: response.pollUrl,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      throw new Error("Payment initiation failed");
    }
  } catch (error: any) {
    console.error("Error creating payment:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Payment processing failed",
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
