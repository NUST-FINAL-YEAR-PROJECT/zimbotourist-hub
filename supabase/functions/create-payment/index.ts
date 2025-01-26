import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Paynow } from 'https://esm.sh/paynow';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  bookingId: string;
  amount: number;
  email: string;
  phone: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookingId, amount, email, phone } = await req.json() as RequestBody;

    // Initialize Paynow
    const paynow = new Paynow(
      Deno.env.get('PAYNOW_INTEGRATION_ID') ?? '',
      Deno.env.get('PAYNOW_INTEGRATION_KEY') ?? ''
    );

    // Set return and result URLs
    paynow.resultUrl = `${Deno.env.get('PUBLIC_URL')}/api/payment-callback`;
    paynow.returnUrl = `${Deno.env.get('PUBLIC_URL')}/dashboard/bookings`;

    // Create payment
    const payment = paynow.createPayment(`Booking-${bookingId}`, email);
    payment.add('Booking Payment', amount);

    // Initiate the payment
    const response = await paynow.sendMobile(payment, phone, 'ecocash');

    if (response.success) {
      // Create payment record in database
      const { data: paymentRecord, error: dbError } = await supabaseClient
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount,
          status: 'pending',
          reference: response.reference,
          poll_url: response.pollUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            reference: response.reference,
            pollUrl: response.pollUrl,
            instructions: response.instructions,
            paymentId: paymentRecord.id,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      throw new Error('Payment initiation failed');
    }
  } catch (error) {
    console.error('Error processing payment:', error);
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