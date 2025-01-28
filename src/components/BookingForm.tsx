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
import { BookingInvoice } from "./BookingInvoice";
import type { Destination } from "@/types/models";

interface BookingFormProps {
  destination: Destination;
  onSuccess: () => void;
}

export const BookingForm = ({ destination, onSuccess }: BookingFormProps) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>();
  const { toast } = useToast();

  const progress = (step / 3) * 100;

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUserId();
  }, []);

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Please log in to make a booking",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          destination_id: destination.id,
          preferred_date: format(date, "yyyy-MM-dd"),
          number_of_people: numberOfPeople,
          total_price: destination.price * numberOfPeople,
          booking_date: new Date().toISOString(),
          user_id: userId,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast({
        title: "Booking created successfully",
        description: "Proceeding to payment...",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive",
      });
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
          <h3 className="text-lg font-semibold">Select Date</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
          <Button
            className="w-full"
            onClick={() => date && setStep(2)}
            disabled={!date}
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Number of People</h3>
          <Input
            type="number"
            min={1}
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
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
              <span>Date</span>
              <span>{date && format(date, "MMMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of People</span>
              <span>{numberOfPeople}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Price</span>
              <span>${destination.price * numberOfPeople}</span>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                Preview Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[700px]">
              {date && <BookingInvoice 
                destination={destination}
                numberOfPeople={numberOfPeople}
                date={date}
              />}
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