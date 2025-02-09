
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, Check, AlertCircle } from "lucide-react";
import type { Booking } from "@/types/models";

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
  const [isProcessing, setIsProcessing] = useState(false);

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
    }
  }, [bookingId, navigate, toast]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // For now, we'll simulate a payment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          booking_id: bookingId,
          amount: booking?.total_price,
          status: "completed",
          payment_method: "card",
          payment_gateway: "stripe", // placeholder
          payment_details: {
            test_mode: true
          }
        });

      if (paymentError) throw paymentError;

      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          payment_status: "completed",
          status: "confirmed"
        })
        .eq("id", bookingId);

      if (bookingError) throw bookingError;

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed.",
        className: "bg-green-50 border-green-200",
      });

      navigate("/dashboard/bookings");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

          {/* Payment Method Section - For now, we'll just show a simple card payment option */}
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Method</h3>
            <div className="rounded-lg border p-4 flex items-center space-x-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Card Payment</p>
                <p className="text-sm text-muted-foreground">Pay securely with your credit or debit card</p>
              </div>
              <Check className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⚬</span>
                Processing...
              </>
            ) : (
              `Pay $${booking.total_price}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

