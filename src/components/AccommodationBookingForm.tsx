
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { addDays, differenceInDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Accommodation } from "@/types/models";

// Define the booking form schema
const bookingFormSchema = z.object({
  check_in_date: z.date({
    required_error: "Check-in date is required",
  }),
  check_out_date: z.date({
    required_error: "Check-out date is required",
  }),
  number_of_guests: z.coerce.number().min(1, {
    message: "At least 1 guest is required",
  }),
  contact_name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  contact_email: z.string().email({
    message: "Please enter a valid email address",
  }),
  contact_phone: z.string().min(6, {
    message: "Please enter a valid phone number",
  }),
  special_requests: z.string().optional(),
}).refine(data => {
  return data.check_out_date > data.check_in_date;
}, {
  message: "Check-out date must be after check-in date",
  path: ["check_out_date"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface AccommodationBookingFormProps {
  accommodation: Accommodation;
  onSuccess?: () => void;
}

export const AccommodationBookingForm = ({
  accommodation,
  onSuccess,
}: AccommodationBookingFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      check_in_date: new Date(),
      check_out_date: addDays(new Date(), 1),
      number_of_guests: 1,
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      special_requests: "",
    },
  });

  const calculateTotalPrice = (values: BookingFormValues) => {
    const nightsStaying = differenceInDays(values.check_out_date, values.check_in_date);
    const basePrice = accommodation.price_per_night * nightsStaying;
    const cleaningFee = accommodation.cleaning_fee || 0;
    const serviceFee = accommodation.service_fee || 0;
    
    return basePrice + cleaningFee + serviceFee;
  };

  const bookingMutation = useMutation({
    mutationFn: async (formData: BookingFormValues) => {
      // Generate a unique booking number
      const bookingNumber = `BK-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      
      const totalPrice = calculateTotalPrice(formData);
      
      // Insert the booking
      const { data, error } = await supabase
        .from("accommodation_bookings")
        .insert({
          accommodation_id: accommodation.id,
          user_id: user?.id,
          booking_number: bookingNumber,
          check_in_date: formData.check_in_date.toISOString(),
          check_out_date: formData.check_out_date.toISOString(),
          number_of_guests: formData.number_of_guests,
          total_price: totalPrice,
          base_price: accommodation.price_per_night * differenceInDays(formData.check_out_date, formData.check_in_date),
          cleaning_fee: accommodation.cleaning_fee || 0,
          service_fee: accommodation.service_fee || 0,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          special_requests: formData.special_requests,
          status: "pending",
          payment_status: "pending",
        } as Database['public']['Tables']['accommodation_bookings']['Insert'])
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "Your accommodation has been booked successfully!",
        variant: "default",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error while processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: BookingFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this accommodation.",
        variant: "destructive",
      });
      return;
    }
    
    bookingMutation.mutate(values);
  };

  // Watch form values for price calculation
  const watchedValues = form.watch();
  const totalPrice = React.useMemo(() => {
    if (watchedValues.check_in_date && watchedValues.check_out_date) {
      return calculateTotalPrice(watchedValues as BookingFormValues);
    }
    return accommodation.price_per_night;
  }, [watchedValues, accommodation]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-in Date */}
          <FormField
            control={form.control}
            name="check_in_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-out Date */}
          <FormField
            control={form.control}
            name="check_out_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-out Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date < new Date() || 
                        date <= form.getValues("check_in_date")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Number of Guests */}
        <FormField
          control={form.control}
          name="number_of_guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={accommodation.max_guests}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 8900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Special Requests */}
        <FormField
          control={form.control}
          name="special_requests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests or requirements?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Summary */}
        <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
          <h3 className="font-medium">Price Summary</h3>
          
          {watchedValues.check_in_date && watchedValues.check_out_date && (
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>
                  ${accommodation.price_per_night} x {differenceInDays(watchedValues.check_out_date, watchedValues.check_in_date)} nights
                </span>
                <span>
                  ${accommodation.price_per_night * differenceInDays(watchedValues.check_out_date, watchedValues.check_in_date)}
                </span>
              </div>
              
              {accommodation.cleaning_fee && accommodation.cleaning_fee > 0 && (
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${accommodation.cleaning_fee}</span>
                </div>
              )}
              
              {accommodation.service_fee && accommodation.service_fee > 0 && (
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${accommodation.service_fee}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={bookingMutation.isPending}
        >
          {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
        </Button>
      </form>
    </Form>
  );
};
