
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkPaymentStatus } from "@/integrations/paynow/client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Get payment details from URL
  const paymentReference = searchParams.get("reference");
  // Try to get pollUrl from URL or session storage
  const pollUrl = searchParams.get("pollUrl") || 
    (paymentReference ? sessionStorage.getItem(`payment_${paymentReference}_pollUrl`) : null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentReference) {
        setStatus("failed");
        toast.error("Missing payment reference");
        return;
      }

      try {
        // Get booking details
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            destinations (
              name,
              image_url
            ),
            events (
              title,
              image_url
            )
          `)
          .eq("id", paymentReference)
          .single();

        if (bookingError) throw bookingError;
        setBookingDetails(booking);

        // If we have a poll URL, check the payment status
        if (pollUrl) {
          console.log("Checking payment status with poll URL:", pollUrl);
          const paymentStatus = await checkPaymentStatus(pollUrl);
          console.log("Payment status response:", paymentStatus);
          
          if (paymentStatus.paid) {
            // Update booking status
            const { error: updateError } = await supabase
              .from("bookings")
              .update({
                payment_status: "completed",
                status: "confirmed"
              })
              .eq("id", paymentReference);

            if (updateError) throw updateError;

            setStatus("success");
            toast.success("Your Zimbabwe booking has been confirmed");
            
            // Clear the pollUrl from session storage
            sessionStorage.removeItem(`payment_${paymentReference}_pollUrl`);
          } else {
            setStatus("failed");
            toast.error("Your payment was not completed. Please try again");
          }
        } else {
          // If no pollUrl, we'll check the booking status directly
          if (booking.payment_status === "completed" || booking.status === "confirmed") {
            setStatus("success");
            toast.success("Your Zimbabwe booking has been confirmed");
          } else {
            // In a real app, we would need a different approach here
            setStatus("loading");
            toast("Your payment is being processed");
            
            // Wait a bit then check the booking status again
            setTimeout(async () => {
              const { data: refreshedBooking } = await supabase
                .from("bookings")
                .select("payment_status, status")
                .eq("id", paymentReference)
                .single();
                
              if (refreshedBooking && 
                  (refreshedBooking.payment_status === "completed" || refreshedBooking.status === "confirmed")) {
                setStatus("success");
                toast.success("Your Zimbabwe booking has been confirmed");
              } else {
                setStatus("failed");
                toast.error("Payment verification timed out. Please check your booking status");
              }
            }, 5000);
          }
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        toast.error(error.message || "Failed to verify payment");
      }
    };

    verifyPayment();
  }, [paymentReference, pollUrl]);

  const getBookingName = () => {
    if (!bookingDetails) return "N/A";
    
    if (bookingDetails.destinations?.name) {
      return bookingDetails.destinations.name;
    } else if (bookingDetails.events?.title) {
      return bookingDetails.events.title;
    }
    
    return "your booking";
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Verifying Zimbabwe Travel Payment</CardTitle>
            <CardDescription>Please wait while we verify your payment</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              We're confirming your payment with the payment provider.
              <br />This may take a few moments...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button 
        variant="outline" 
        onClick={() => navigate('/dashboard/bookings')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go to My Bookings
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {status === "success" ? "Zimbabwe Travel Payment Successful" : "Zimbabwe Travel Payment Failed"}
          </CardTitle>
          <CardDescription>
            {status === "success" 
              ? "Your payment has been processed successfully" 
              : "There was an issue with your payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-6">
            {status === "success" ? (
              <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
            ) : (
              <XCircle className="h-20 w-20 text-red-500 mb-4" />
            )}

            <h3 className="text-xl font-semibold mb-2">
              {status === "success" ? "Thank You For Your Payment" : "Payment Could Not Be Completed"}
            </h3>

            <p className="text-center text-muted-foreground mb-4">
              {status === "success" 
                ? `Your booking for ${getBookingName()} has been confirmed. We look forward to welcoming you to Zimbabwe!`
                : "We couldn't process your payment. Please try again or contact customer support."}
            </p>
          </div>

          {bookingDetails && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Booking Reference</span>
                <span className="text-sm text-muted-foreground">
                  {bookingDetails.id ? bookingDetails.id.slice(0, 8) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {bookingDetails.destinations ? "Destination" : "Event"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {getBookingName()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Travel Date</span>
                <span className="text-sm text-muted-foreground">
                  {(bookingDetails.preferred_date 
                    ? new Date(bookingDetails.preferred_date).toLocaleDateString()
                    : bookingDetails.events?.start_date
                      ? new Date(bookingDetails.events.start_date).toLocaleDateString()
                      : 'N/A')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Number of People</span>
                <span className="text-sm text-muted-foreground">
                  {bookingDetails.number_of_people || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold">Total Amount</span>
                <span className="font-semibold text-primary">
                  ${bookingDetails.total_price || 0}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate('/dashboard/bookings')} variant="default">
              View My Zimbabwe Bookings
            </Button>
            {status === "failed" && bookingDetails?.destination_id && (
              <Button onClick={() => navigate(`/destination/${bookingDetails.destination_id}`)} variant="outline">
                Try Payment Again
              </Button>
            )}
            {status === "failed" && bookingDetails?.event_id && (
              <Button onClick={() => navigate(`/events/${bookingDetails.event_id}`)} variant="outline">
                Try Payment Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
