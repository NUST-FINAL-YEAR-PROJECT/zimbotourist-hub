
import { supabase } from "@/integrations/supabase/client";
import { createPayment } from "@/integrations/paynow/client";

export type PaymentProvider = "stripe" | "paynow";
export type PaymentItem = { name: string; amount: number };

export interface PaymentDetails {
  amount: number;
  reference: string;
  email: string;
  phone: string;
  items?: PaymentItem[];
  description?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  successCallback?: () => void;
  errorCallback?: (error: Error) => void;
}

// Define the response types for different payment providers
export type PaynowPaymentResponse = {
  success: boolean;
  redirectUrl: string;
  pollUrl: string;
  reference: string;
};

export type StripePaymentResponse = {
  success: boolean;
  clientSecret: string;
  redirectUrl: string;
};

export type PaymentResponse = PaynowPaymentResponse | StripePaymentResponse;

/**
 * Processes a payment using the specified provider
 * @param provider The payment provider to use
 * @param details Payment details
 * @returns Promise resolving to the payment result
 */
export const processPayment = async (
  provider: PaymentProvider,
  details: PaymentDetails
): Promise<PaymentResponse> => {
  try {
    console.log(`Processing payment via ${provider}`, details);
    
    // Validate common required fields
    if (!details.amount || !details.reference || !details.email) {
      throw new Error("Missing required payment details");
    }
    
    if (provider === "paynow") {
      return await processPaynowPayment(details);
    } else if (provider === "stripe") {
      return await processStripePayment(details);
    } else {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }
  } catch (error: any) {
    console.error("Payment processing error:", error);
    if (details.errorCallback) {
      details.errorCallback(error);
    }
    throw error;
  }
};

/**
 * Process payment using Paynow
 */
const processPaynowPayment = async (details: PaymentDetails): Promise<PaynowPaymentResponse> => {
  const { amount, reference, email, phone, items, returnUrl } = details;
  
  if (!phone) {
    throw new Error("Phone number is required for Paynow payments");
  }
  
  // Create default return URL if not provided
  const finalReturnUrl = returnUrl || `${window.location.origin}/payment-status`;
  
  // Create payment using Paynow client
  const response = await createPayment(
    email,
    phone,
    amount,
    reference,
    items || [{ name: "Zimbabwe Travel Booking", amount }]
  );
  
  if (response.success && response.redirectUrl) {
    return {
      success: true,
      redirectUrl: response.redirectUrl,
      pollUrl: response.pollUrl,
      reference: response.reference,
    };
  } else {
    throw new Error(response.error || "Payment initialization failed");
  }
};

/**
 * Process payment using Stripe
 */
const processStripePayment = async (details: PaymentDetails): Promise<StripePaymentResponse> => {
  const { reference: bookingId, amount, metadata = {} } = details;
  
  // Get current authentication session
  const { data, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    throw new Error(sessionError.message);
  }
  
  if (!data?.session) {
    throw new Error("No active session found");
  }
  
  // Create a payment intent
  const response = await supabase.functions.invoke(
    'create-payment-intent',
    {
      body: {
        bookingId,
        amount,
        metadata
      },
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    }
  );
  
  if (response.error) {
    console.error("Payment intent error:", response.error);
    throw new Error(response.error.message || 'Failed to create payment intent');
  }
  
  if (!response.data?.clientSecret) {
    throw new Error("No client secret returned");
  }
  
  return {
    success: true,
    clientSecret: response.data.clientSecret,
    redirectUrl: `/dashboard/payment?booking_id=${bookingId}`
  };
};
