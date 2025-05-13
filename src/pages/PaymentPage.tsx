
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { Booking } from "@/types/models";
import { PaymentForm } from "@/components/PaymentForm";
import { useIsMobile } from "@/hooks/useIsMobile";

// Initialize Stripe with the publishable key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) 
  : null;

// Configure Stripe Appearance
const appearance: Parameters<typeof Elements>[0]['options']['appearance'] = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0F172A',
    colorBackground: '#ffffff',
    colorText: '#1e293b',
    colorDanger: '#df1b41',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
};

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
  const isMobile = useIsMobile();

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
      const setupPayment = async () => {
        try {
          // Get the current session
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
                amount: booking.total_price,
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

          setClientSecret(response.data.clientSecret);
        } catch (error: any) {
          console.error("Payment setup error:", error);
          toast({
            variant: "destructive",
            title: "Payment Setup Failed",
            description: error.message || "Failed to set up payment",
          });
          navigate("/dashboard");
        }
      };

      setupPayment();
    }
  }, [bookingId, booking, navigate, toast]);

  if (isLoading) {
    return (
      <div className={cn("container mx-auto p-6", isMobile ? "max-w-full" : "max-w-2xl")}>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={cn("container mx-auto p-6", isMobile ? "max-w-full" : "max-w-2xl")}>
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
    <div className={cn("container mx-auto p-6", isMobile ? "max-w-full" : "max-w-2xl")}>
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
            Secure payment for your booking at {booking?.destinations?.name || "selected destination"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Booking Reference</span>
              <span className="text-sm text-muted-foreground">{booking?.id ? booking.id.slice(0, 8) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Travel Date</span>
              <span className="text-sm text-muted-foreground">
                {booking && booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Number of People</span>
              <span className="text-sm text-muted-foreground">{booking?.number_of_people || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold">Total Amount</span>
              <span className="font-semibold text-primary">${booking?.total_price || 0}</span>
            </div>
          </div>

          {clientSecret && stripePromise && (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance,
                paymentMethodCreation: 'manual',
                payment_method_types: ['card'],
              }}
            >
              <PaymentForm bookingId={bookingId as string} />
            </Elements>
          )}

          {(!clientSecret || !stripePromise) && (
            <div className="text-center p-4">
              <Skeleton className="h-12 w-full mb-4" />
              <p className="text-sm text-muted-foreground">
                {!stripePromise ? "Stripe is not configured properly." : "Preparing payment options..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for class names
const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};
