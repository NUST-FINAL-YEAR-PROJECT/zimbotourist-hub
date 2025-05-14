
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentFormProps {
  bookingId: string;
}

export const PaymentForm = ({ bookingId }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe not initialized");
      return;
    }

    setIsProcessing(true);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-status?reference=${bookingId}`,
          payment_method_data: {
            billing_details: {
              address: {
                country: 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update booking status
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({
            payment_status: "completed",
            status: "confirmed",
            payment_gateway: "stripe",
            payment_gateway_reference: paymentIntent.id
          })
          .eq("id", bookingId);

        if (bookingError) throw bookingError;

        toast.success("Your booking has been confirmed");
        navigate(`/payment-status?reference=${bookingId}`);
      } else {
        // This should only happen if redirect is needed and not taken automatically
        navigate(`/payment-status?reference=${bookingId}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        className="payment-element"
        options={{
          layout: "tabs",
          paymentMethodOrder: ['google_pay', 'card'],
          defaultValues: {
            billingDetails: {
              name: '',
              email: '',
              phone: '',
            }
          }
        }}
      />
      <Button 
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <span className="animate-spin mr-2">⚬</span>
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
};
