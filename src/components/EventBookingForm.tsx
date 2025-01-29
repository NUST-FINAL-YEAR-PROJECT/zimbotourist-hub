import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BookingInvoice } from "./BookingInvoice";
import type { Event } from "@/types/models";

interface EventBookingFormProps {
  event: Event;
  onSuccess: () => void;
}

export const EventBookingForm = ({ event, onSuccess }: EventBookingFormProps) => {
  const [step, setStep] = useState(1);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>();

  const progress = (step / 3) * 100;

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUserId();
  }, []);

  const handleSubmit = async () => {
    if (!contactName || !contactEmail || !contactPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!userId) {
      toast.error("Please log in to make a booking");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          event_id: event.id,
          number_of_people: numberOfPeople,
          total_price: event.price * numberOfPeople,
          booking_date: new Date().toISOString(),
          user_id: userId,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create the payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          booking_id: booking.id,
          amount: event.price * numberOfPeople,
          status: "pending",
        });

      if (paymentError) throw paymentError;

      toast.success("Booking created successfully. Proceeding to payment...");
      onSuccess();
    } catch (error: any) {
      toast.error("Error creating booking: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Progress value={progress} className="w-full" />

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Number of People</h3>
          <Input
            type="number"
            min={1}
            max={event.capacity || undefined}
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
          />
          <Button className="w-full" onClick={() => setStep(2)}>
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Details</h3>
          <Input
            placeholder="Full Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => setStep(3)}
              disabled={!contactName || !contactEmail || !contactPhone}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Confirm Booking</h3>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span>Event</span>
              <span>{event.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span>{format(new Date(event.start_date), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of People</span>
              <span>{numberOfPeople}</span>
            </div>
            <div className="flex justify-between">
              <span>Contact Name</span>
              <span>{contactName}</span>
            </div>
            <div className="flex justify-between">
              <span>Contact Email</span>
              <span>{contactEmail}</span>
            </div>
            <div className="flex justify-between">
              <span>Contact Phone</span>
              <span>{contactPhone}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Price</span>
              <span>${event.price * numberOfPeople}</span>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                Preview Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[700px]">
              <BookingInvoice 
                event={event}
                numberOfPeople={numberOfPeople}
                date={new Date(event.start_date)}
                contactName={contactName}
                contactEmail={contactEmail}
                contactPhone={contactPhone}
              />
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Booking..." : "Confirm & Pay"}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};