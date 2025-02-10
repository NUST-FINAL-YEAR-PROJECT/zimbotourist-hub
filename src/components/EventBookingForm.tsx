
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Event } from "@/types/models";

interface EventBookingFormProps {
  event: Event;
  onSuccess: () => void;
}

export const EventBookingForm = ({ event, onSuccess }: EventBookingFormProps) => {
  const [step, setStep] = useState(1);
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState(
    event.ticket_types?.[0] || { name: "General Admission", price: event.price }
  );
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const progress = (step / 3) * 100;
  const totalPrice = (selectedTicketType.price || event.price || 0) * numberOfTickets;

  const handleSubmit = async () => {
    if (!user) {
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

    setIsSubmitting(true);
    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          event_id: event.id,
          user_id: user.id,
          booking_date: new Date().toISOString(),
          number_of_people: numberOfTickets,
          total_price: totalPrice,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          selected_ticket_type: selectedTicketType,
          status: "pending",
          payment_status: "pending"
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast({
        title: "Booking Created Successfully",
        description: "Redirecting to payment...",
        className: "bg-green-50 border-green-200"
      });
      
      // Redirect to payment page
      navigate(`/dashboard/payment?booking_id=${booking.id}`);
    } catch (error: any) {
      toast({
        title: "Booking Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Progress value={progress} className="w-full" />
      
      <div className="min-h-[400px]">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Tickets</h3>
              <div className="space-y-4">
                {event.ticket_types ? (
                  event.ticket_types.map((type: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicketType.name === type.name
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTicketType(type)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                        <span className="font-semibold">${type.price}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">General Admission</h4>
                      </div>
                      <span className="font-semibold">${event.price}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Number of Tickets</h4>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setNumberOfTickets((prev) => Math.max(1, prev - 1))}
                  disabled={numberOfTickets <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={numberOfTickets}
                  onChange={(e) => setNumberOfTickets(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  onClick={() => setNumberOfTickets((prev) => prev + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
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
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Booking Summary</h3>
              <div className="rounded-lg border p-6 space-y-4 bg-muted/50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {event.start_date && format(new Date(event.start_date), "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ticket Type</span>
                    <span className="font-medium">{selectedTicketType.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Number of Tickets</span>
                    <span className="font-medium">{numberOfTickets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per Ticket</span>
                    <span className="font-medium">
                      ${selectedTicketType.price || event.price}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Price</span>
                    <span className="font-semibold">${totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep((prev) => prev - 1)}
          >
            Back
          </Button>
        )}
        
        {step < 3 ? (
          <Button
            className="flex-1"
            onClick={() => setStep((prev) => prev + 1)}
            disabled={step === 2 && (!contactName || !contactEmail || !contactPhone)}
          >
            Next
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
    </div>
  );
};
