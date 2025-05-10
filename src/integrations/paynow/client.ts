
// Paynow integration client for browser environments
import { supabase } from "@/integrations/supabase/client";

// Types
export interface PaynowPaymentResponse {
  success: boolean;
  hash?: string;
  redirectUrl?: string;
  pollUrl?: string;
  instructions?: string;
  error?: string;
  reference?: string;
}

interface PaynowItem {
  name: string;
  amount: number;
}

/**
 * Create a payment in Paynow via our server-side function
 * @param email Customer's email address
 * @param phone Customer's phone number
 * @param amount Amount to pay
 * @param reference Unique payment reference
 * @param items Items being paid for (optional)
 * @returns Payment response with redirect URL
 */
export const createPayment = async (
  email: string,
  phone: string,
  amount: number,
  reference: string,
  items?: PaynowItem[]
): Promise<PaynowPaymentResponse> => {
  try {
    // Get authenticated user token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      throw new Error("Authentication required for payment");
    }

    // Check if the Supabase Functions URL is defined
    const supabaseFunctionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
    if (!supabaseFunctionsUrl) {
      console.error("VITE_SUPABASE_FUNCTIONS_URL is not defined in environment variables");
      throw new Error("Payment service configuration is missing");
    }

    console.log("Making payment request to:", `${supabaseFunctionsUrl}/create-paynow-payment`);

    // Send the payment request to our Supabase Edge Function
    const response = await fetch(`${supabaseFunctionsUrl}/create-paynow-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email,
        phone,
        amount,
        reference,
        items: items || [{ name: "Zimbabwe Travel Booking", amount }],
        returnUrl: `${window.location.origin}/payment-status`,
      }),
    });

    // Handle non-JSON responses (like HTML errors)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response received:', responseText);
      throw new Error('Invalid response from payment server');
    }

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || "Payment initiation failed");
    }

    return {
      success: true,
      hash: responseData.hash,
      redirectUrl: responseData.redirectUrl,
      pollUrl: responseData.pollUrl,
      reference
    };
  } catch (error: any) {
    console.error("Paynow payment error:", error);
    return {
      success: false,
      error: error.message || "Payment processing failed",
    };
  }
};

/**
 * Check payment status
 * @param pollUrl URL to check payment status
 * @returns Payment status
 */
export const checkPaymentStatus = async (pollUrl: string): Promise<{
  paid: boolean;
  status: string;
}> => {
  try {
    // Get authenticated user token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      throw new Error("Authentication required for checking payment status");
    }

    // Check if the Supabase Functions URL is defined
    const supabaseFunctionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
    if (!supabaseFunctionsUrl) {
      console.error("VITE_SUPABASE_FUNCTIONS_URL is not defined in environment variables");
      throw new Error("Payment service configuration is missing");
    }

    // Call our Edge function to check the status
    const response = await fetch(`${supabaseFunctionsUrl}/check-paynow-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ pollUrl }),
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response received:', responseText);
      throw new Error('Invalid response from payment status server');
    }

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.error || "Failed to check payment status");
    }

    const responseData = await response.json();
    return {
      paid: responseData.paid,
      status: responseData.status,
    };
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return {
      paid: false,
      status: "error",
    };
  }
};
