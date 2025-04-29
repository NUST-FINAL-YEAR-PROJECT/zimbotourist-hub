
// Paynow integration client for browser environments

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
    // Send the payment request to our Supabase Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-paynow-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase-auth-token')}`,
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Payment initiation failed");
    }

    const data = await response.json();
    return {
      success: true,
      hash: data.hash,
      redirectUrl: data.redirectUrl,
      pollUrl: data.pollUrl,
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
    // Call our Edge function to check the status
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/check-paynow-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pollUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to check payment status");
    }

    const data = await response.json();
    return {
      paid: data.paid,
      status: data.status,
    };
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return {
      paid: false,
      status: "error",
    };
  }
};
