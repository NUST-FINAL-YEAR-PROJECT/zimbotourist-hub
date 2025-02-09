
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { Booking } from "@/types/models";
import { PaymentForm } from "@/components/PaymentForm";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type BookingWithDestination = Booking & {
  destinations: {
    name: string;
    image_url: string | null;
  } | null;
};

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error("No booking ID provided");
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          destinations (
            name,
            image_url
          )
        `)
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      return data as BookingWithDestination;
    },
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (!bookingId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No booking ID provided",
      });
      navigate("/dashboard");
      return;
    }

    if (booking) {
      // Create a payment record and get a payment intent
      const setupPayment = async () => {
        try {
          // First create a payment record
          const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .insert({
              booking_id: bookingId,
              amount: booking.total_price,
              status: "pending",
              payment_method: "card",
              payment_gateway: "stripe",
            })
            .select()
            .single();

          if (paymentError) throw paymentError;

          // Then create a payment intent
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: JSON.stringify({
                bookingId,
                amount: booking.total_price,
              }),
            }
          );

          const { clientSecret, error } = await response.json();
          if (error) throw new Error(error);
          
          setClientSecret(clientSecret);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Payment Setup Failed",
            description: error.message,
          });
        }
      };

      setupPayment();
    }
  }, [bookingId, booking, navigate, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Booking Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  We couldn't find the booking you're looking for.
                </p>
              </div>
              <Button onClick={() => navigate("/dashboard")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Secure payment for your booking at {booking.destinations?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Booking Reference</span>
              <span className="text-sm text-muted-foreground">{booking.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Travel Date</span>
              <span className="text-sm text-muted-foreground">
                {new Date(booking.booking_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Number of People</span>
              <span className="text-sm text-muted-foreground">{booking.number_of_people}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold">Total Amount</span>
              <span className="font-semibold text-primary">${booking.total_price}</span>
            </div>
          </div>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm bookingId={bookingId} />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
