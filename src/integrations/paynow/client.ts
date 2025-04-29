
import Paynow from "paynow";

// Initialize Paynow
export const paynow = new Paynow(
  import.meta.env.VITE_PAYNOW_INTEGRATION_ID || "19883", // Default value for development
  import.meta.env.VITE_PAYNOW_INTEGRATION_KEY || "bda043a3-ebf6-4c4a-ab8c-1365b6f7a210" // Default value for development
);

// Set return URL for web payments - this should be the URL to your payment success page
paynow.resultUrl = `${window.location.origin}/dashboard/bookings`;
paynow.returnUrl = `${window.location.origin}/dashboard/bookings`;

export interface PaynowPaymentResponse {
  success: boolean;
  hash?: string;
  redirectUrl?: string;
  pollUrl?: string;
  instructions?: string;
  error?: string;
  reference?: string;
}

/**
 * Create a payment in Paynow
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
  items?: { name: string; amount: number }[]
): Promise<PaynowPaymentResponse> => {
  try {
    // Create payment
    const payment = paynow.createPayment(reference, email);
    
    // Add items or just the total
    if (items && items.length > 0) {
      items.forEach(item => {
        payment.add(item.name, item.amount);
      });
    } else {
      payment.add("Zimbabwe Travel Booking", amount);
    }

    // Initiate the payment
    const response = await paynow.send(payment);

    if (response.success) {
      return {
        success: true,
        hash: response.hash,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl,
        reference
      };
    } else {
      return {
        success: false,
        error: "Payment initiation failed",
      };
    }
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
    const status = await paynow.pollTransaction(pollUrl);
    return {
      paid: status.paid,
      status: status.status,
    };
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return {
      paid: false,
      status: "error",
    };
  }
};
