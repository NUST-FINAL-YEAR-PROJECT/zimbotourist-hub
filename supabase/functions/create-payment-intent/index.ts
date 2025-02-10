
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header received:', authHeader ? 'present' : 'missing')

    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Ensure the header is in the correct format
    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted from header')

    // Create Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    console.log('Auth check result:', userError ? 'error' : 'success')

    if (userError) {
      console.error('User error:', userError)
      throw new Error('Authentication failed')
    }

    if (!user) {
      console.error('No user found')
      throw new Error('User not found')
    }

    console.log('User authenticated:', user.id)

    // Parse the request body
    const { bookingId, amount } = await req.json()
    console.log('Received booking data:', { bookingId, amount })

    if (!bookingId || !amount) {
      throw new Error('Missing required fields')
    }

    // Verify that the booking belongs to the user
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      throw new Error('Error fetching booking')
    }

    if (!booking) {
      throw new Error('Booking not found or unauthorized')
    }

    console.log('Booking verified for user')

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId,
        userId: user.id,
      },
    })

    console.log('Payment intent created:', paymentIntent.id)

    // Update the payment record in Supabase
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        payment_intent_id: paymentIntent.id,
        status: 'processing',
        payment_details: {
          client_secret: paymentIntent.client_secret,
        },
      })
      .eq('booking_id', bookingId)

    if (paymentError) {
      console.error('Payment record update error:', paymentError)
      throw paymentError
    }

    console.log('Payment record updated successfully')

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-payment-intent:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
