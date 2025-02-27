
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

interface AccommodationBookingFormProps {
  accommodation: {
    id: string;
    name: string;
    price_per_night: number;
    max_guests: number;
  };
}

interface BookingFormData {
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
}

export const AccommodationBookingForm = ({
  accommodation,
}: AccommodationBookingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      checkIn: new Date(),
      checkOut: addDays(new Date(), 1),
      numberOfGuests: 1,
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const numberOfNights = differenceInDays(checkOut, checkIn);
  const totalPrice = accommodation.price_per_night * numberOfNights;

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast.error("Please sign in to make a booking");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: booking, error } = await supabase
        .from("accommodation_bookings")
        .insert({
          accommodation_id: accommodation.id,
          user_id: user.id,
          check_in_date: format(data.checkIn, "yyyy-MM-dd"),
          check_out_date: format(data.checkOut, "yyyy-MM-dd"),
          number_of_guests: data.numberOfGuests,
          total_price: totalPrice,
          contact_name: data.contactName,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          special_requests: data.specialRequests,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Booking submitted successfully!");
      navigate("/dashboard/bookings");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Check-in Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(date) => date && setValue("checkIn", date)}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Check-out Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(date) => date && setValue("checkOut", date)}
                disabled={(date) => date <= checkIn}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfGuests">Number of Guests</Label>
        <Input
          type="number"
          id="numberOfGuests"
          min={1}
          max={accommodation.max_guests}
          {...register("numberOfGuests", {
            required: "Number of guests is required",
            min: {
              value: 1,
              message: "Minimum 1 guest required",
            },
            max: {
              value: accommodation.max_guests,
              message: `Maximum ${accommodation.max_guests} guests allowed`,
            },
          })}
        />
        {errors.numberOfGuests && (
          <p className="text-sm text-destructive">
            {errors.numberOfGuests.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName">Contact Name</Label>
        <Input
          id="contactName"
          {...register("contactName", {
            required: "Contact name is required",
          })}
        />
        {errors.contactName && (
          <p className="text-sm text-destructive">
            {errors.contactName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          type="email"
          id="contactEmail"
          {...register("contactEmail", {
            required: "Contact email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.contactEmail && (
          <p className="text-sm text-destructive">
            {errors.contactEmail.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input
          id="contactPhone"
          {...register("contactPhone", {
            required: "Contact phone is required",
          })}
        />
        {errors.contactPhone && (
          <p className="text-sm text-destructive">
            {errors.contactPhone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Input
          id="specialRequests"
          {...register("specialRequests")}
        />
      </div>

      <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Price per night</span>
          <span>${accommodation.price_per_night}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Number of nights</span>
          <span>{numberOfNights}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Confirm Booking"}
      </Button>
    </form>
  );
};
