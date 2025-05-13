
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentProcessor } from "@/components/PaymentProcessor";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

export const StandalonePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
    
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        
        // Check if it's an event booking or destination booking
        let bookingData;
        
        // Try to get destination booking first
        let { data: destinationBooking, error: destinationError } = await supabase
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
          
        // If destination booking exists, use it
        if (destinationBooking && !destinationError) {
          bookingData = {
            ...destinationBooking,
            itemName: `Zimbabwe Travel: ${destinationBooking.destinations?.name || "Travel Package"}`,
            type: "destination"
          };
        } else {
          // Try to get event booking
          let { data: eventBooking, error: eventError } = await supabase
            .from("bookings")
            .select(`
              *,
              event_id,
              events (
                title,
                image_url
              )
            `)
            .eq("id", bookingId)
            .single();
            
          if (eventBooking && !eventError) {
            bookingData = {
              ...eventBooking,
              itemName: `Event Ticket: ${eventBooking.events?.title || "Zimbabwe Event"}`,
              type: "event"
            };
          }
        }
        
        if (!bookingData) {
          throw new Error("Booking not found");
        }
        
        // Check if the booking belongs to the current user
        if (bookingData.user_id !== user?.id) {
          throw new Error("Unauthorized access to booking");
        }
        
        setBooking(bookingData);
      } catch (error: any) {
        console.error("Error fetching booking:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load booking details",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId, navigate, toast, user?.id]);
  
  const handlePaymentComplete = () => {
    toast({
      title: "Payment Processing",
      description: "Your payment is being processed.",
      className: "bg-green-50 border-green-200",
    });
  };
  
  if (isLoading) {
    return (
      <div className={cn("container mx-auto p-6", isMobile ? "max-w-full" : "max-w-2xl")}>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className={cn("container mx-auto p-6", isMobile ? "max-w-full" : "max-w-2xl")}>
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle>Booking Not Found</CardTitle>
            <CardDescription>We couldn't find the booking you're looking for</CardDescription>
          </CardHeader>
          <div className="p-6 flex justify-center">
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
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
      
      <PaymentProcessor
        bookingId={bookingId as string}
        amount={booking.total_price}
        email={booking.contact_email || user?.email || ""}
        phone={booking.contact_phone || ""}
        itemName={booking.itemName || "Zimbabwe Travel"}
        description={`Payment for ${booking.type === "event" ? "event ticket" : "travel booking"}`}
        onPaymentComplete={handlePaymentComplete}
        paymentProviders={["paynow", "stripe"]}
      />
    </div>
  );
};
