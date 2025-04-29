
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createPayment } from "@/integrations/paynow/client";
import { BookingInvoice } from "./BookingInvoice";
import { DuplicateBookingAlert } from "./DuplicateBookingAlert";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Users, Mail, Phone, Receipt } from "lucide-react";
import type { Destination } from "@/types/models";
import type { Database } from "@/integrations/supabase/types";

interface BookingFormProps {
  destination: Destination;
  onSuccess: () => void;
}

export const BookingForm = ({ destination, onSuccess }: BookingFormProps) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [hasCheckedDuplicate, setHasCheckedDuplicate] = useState(false);
  const { toast } = useToast();

  const progress = (step / 4) * 100;

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUserId();
  }, []);

  const checkForDuplicateBookings = async () => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .eq("destination_id", destination.id)
        .in("status", ["pending", "confirmed"])
        .in("payment_status", ["pending", "processing"]);

      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking for duplicate bookings:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: "Select Travel Date",
        description: "Please choose your preferred travel date to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to your account before making a booking.",
        variant: "destructive"
      });
      return;
    }

    if (!contactName || !contactEmail || !contactPhone) {
      toast({
        title: "Complete Contact Information",
        description: "Please fill in all required contact details to proceed.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate bookings if we haven't already
    if (!hasCheckedDuplicate) {
      setHasCheckedDuplicate(true);
      const hasDuplicate = await checkForDuplicateBookings();
      
      if (hasDuplicate) {
        setShowDuplicateAlert(true);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Create a new booking record
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          destination_id: destination.id,
          preferred_date: format(date, "yyyy-MM-dd"),
          number_of_people: numberOfPeople,
          total_price: destination.price * numberOfPeople,
          booking_date: new Date().toISOString(),
          user_id: userId,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          status: "pending",
          payment_status: "pending"
        } as Database['public']['Tables']['bookings']['Insert'])
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast({
        title: "Booking Created Successfully",
        description: "Redirecting to payment...",
        className: "bg-green-50 border-green-200"
      });
      
      // Initialize Paynow payment
      const amount = destination.price * numberOfPeople;
      const paymentResponse = await createPayment(
        contactEmail,
        contactPhone,
        amount,
        booking?.id || 'BOOKING',
        [{ name: `Booking: ${destination.name}`, amount }]
      );

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || "Failed to initialize payment");
      }

      // Redirect to Paynow for payment
      if (paymentResponse.redirectUrl) {
        window.location.href = paymentResponse.redirectUrl;
      } else {
        throw new Error("No redirect URL provided by payment gateway");
      }
      
    } catch (error: any) {
      toast({
        title: "Booking Creation Failed",
        description: error.message || "An error occurred while creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAnyway = () => {
    setShowDuplicateAlert(false);
    // Continue with the booking submission
    handleSubmit();
  };

  const stepContent = {
    1: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2 text-lg font-semibold">
          <CalendarIcon className="h-5 w-5" />
          <h3>Select Date</h3>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border mx-auto"
          disabled={(date) => date < new Date()}
        />
      </motion.div>
    ),
    2: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5" />
          <h3>Number of People</h3>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setNumberOfPeople(prev => Math.max(1, prev - 1))}
            disabled={numberOfPeople <= 1}
          >
            -
          </Button>
          <Input
            type="number"
            min={1}
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
            className="text-center"
          />
          <Button
            variant="outline"
            onClick={() => setNumberOfPeople(prev => prev + 1)}
          >
            +
          </Button>
        </div>
      </motion.div>
    ),
    3: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-5 w-5" />
            <h3>Contact Information</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            We'll use these details to send your booking confirmation
          </p>
        </div>
        <div className="space-y-4">
          <Input
            placeholder="Full Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Phone Number"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
          />
        </div>
      </motion.div>
    ),
    4: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Receipt className="h-5 w-5" />
          <h3>Booking Summary</h3>
        </div>
        <div className="rounded-lg border p-6 space-y-4 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{date && format(date, "MMMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of People</span>
              <span className="font-medium">{numberOfPeople}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per Person</span>
              <span className="font-medium">${destination.price}</span>
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between">
              <span className="font-semibold">Total Price</span>
              <span className="font-semibold">${destination.price * numberOfPeople}</span>
            </div>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Receipt className="h-4 w-4" />
              Preview Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[700px]">
            {date && <BookingInvoice 
              destination={destination}
              numberOfPeople={numberOfPeople}
              date={date}
              contactDetails={{
                name: contactName,
                email: contactEmail,
                phone: contactPhone
              }}
            />}
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  };

  return (
    <div className="space-y-6">
      <Progress value={progress} className="w-full" />
      
      <div className="min-h-[400px]">
        {stepContent[step as keyof typeof stepContent]}
      </div>

      <div className="flex gap-2 pt-4">
        {step > 1 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setStep(prev => prev - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        
        {step < 4 ? (
          <Button
            className="flex-1 gap-2"
            onClick={() => setStep(prev => prev + 1)}
            disabled={
              (step === 1 && !date) ||
              (step === 3 && (!contactName || !contactEmail || !contactPhone))
            }
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⚬</span>
                Processing...
              </>
            ) : (
              "Confirm & Pay"
            )}
          </Button>
        )}
      </div>

      <DuplicateBookingAlert
        open={showDuplicateAlert}
        onOpenChange={setShowDuplicateAlert}
        onContinue={handleContinueAnyway}
        destinationName={destination.name}
      />
    </div>
  );
};
