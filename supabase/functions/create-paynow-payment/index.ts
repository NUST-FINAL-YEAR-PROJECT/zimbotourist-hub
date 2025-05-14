
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

// Log helper
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYNOW-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    logStep("Function started");
    
    // Parse request body
    const { email, phone, amount, reference, items, returnUrl } = await req.json();
    
    logStep("Request body parsed", { email, phone, amount, reference, returnUrl });

    // Validate required parameters
    if (!email || !amount || !reference || !returnUrl) {
      throw new Error("Missing required parameters: email, amount, reference, and returnUrl are required");
    }

    // Create payment
    const payment = paynow.createPayment(reference, email);
    logStep("Payment created", { reference, email });
    
    // Set return URLs (must be absolute URLs)
    const baseReturnUrl = returnUrl.includes("?") 
      ? `${returnUrl}&reference=${reference}` 
      : `${returnUrl}?reference=${reference}`;
      
    paynow.resultUrl = baseReturnUrl;
    paynow.returnUrl = baseReturnUrl;
    
    logStep("Return URLs set", { resultUrl: paynow.resultUrl, returnUrl: paynow.returnUrl });
    
    // Add items
    if (items && items.length > 0) {
      items.forEach((item: { name: string, amount: number }) => {
        payment.add(item.name, item.amount);
      });
      logStep("Added multiple items", { itemCount: items.length });
    } else {
      payment.add("Zimbabwe Travel Booking", amount);
      logStep("Added single item", { name: "Zimbabwe Travel Booking", amount });
    }

    // Send payment to Paynow
    logStep("Sending payment to Paynow");
    const response = await paynow.send(payment);
    logStep("Paynow response received", { 
      success: response.success,
      hash: response.hash,
      hasRedirectUrl: !!response.redirectUrl,
      hasPollUrl: !!response.pollUrl
    });
    
    if (response.success) {
      // Update the booking payment details
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          await supabase.from("bookings")
            .update({
              payment_gateway: "paynow",
              payment_gateway_reference: response.hash
            })
            .eq("id", reference);
            
          logStep("Updated booking payment details", { bookingId: reference });
        }
      } catch (dbError) {
        // Don't fail the payment if DB update fails, just log it
        console.error("Failed to update booking details:", dbError);
      }
      
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
      throw new Error("Payment initiation failed: " + (response.error || "Unknown error"));
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
