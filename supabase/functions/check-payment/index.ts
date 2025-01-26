import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Paynow } from 'https://esm.sh/paynow';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get payment details from database
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError) throw paymentError;

    // Initialize Paynow
    const paynow = new Paynow(
      Deno.env.get('PAYNOW_INTEGRATION_ID') ?? '',
      Deno.env.get('PAYNOW_INTEGRATION_KEY') ?? ''
    );

    // Check payment status
    const status = await paynow.pollTransaction(payment.poll_url);

    // Update payment status in database
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({ status: status.status.toLowerCase() })
      .eq('id', paymentId);

    if (updateError) throw updateError;

    // If payment is paid, update booking status
    if (status.status.toLowerCase() === 'paid') {
      const { error: bookingError } = await supabaseClient
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', payment.booking_id);

      if (bookingError) throw bookingError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: status.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error checking payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});