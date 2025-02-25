
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingWithRelations } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, BanIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion } from "framer-motion";

export const MyBookings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"delete" | "cancel" | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          destinations (name, image_url),
          events (title, image_url)
        `)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return data as BookingWithRelations[];
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Booking deleted",
        description: "Your booking has been successfully deleted."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: 'cancelled',
          cancellation_date: new Date().toISOString()
        })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const handleAction = (bookingId: string) => {
    if (actionType === 'delete') {
      deleteBookingMutation.mutate(bookingId);
    } else if (actionType === 'cancel') {
      cancelBookingMutation.mutate(bookingId);
    }
    setSelectedBookingId(null);
    setActionType(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <p className="text-muted-foreground">No bookings found</p>
          <Button className="mt-4" variant="outline">Make a Booking</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle>My Bookings</CardTitle>
      </CardHeader>
      
      {bookings.map((booking) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {booking.destinations?.name || booking.events?.title}
                    </h3>
                    <Badge 
                      variant={
                        booking.status === 'confirmed' ? 'default' :
                        booking.status === 'cancelled' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Booked for: {new Date(booking.booking_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    {booking.number_of_people} {booking.number_of_people === 1 ? 'person' : 'people'} • 
                    ${booking.total_price.toFixed(2)}
                  </p>
                </div>
                
                {booking.status !== 'cancelled' && (
                  <div className="flex gap-2 self-start">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          className="text-yellow-600 hover:text-yellow-700"
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setActionType('cancel');
                          }}
                        >
                          <BanIcon className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSelectedBookingId(null)}>
                            No, keep it
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => selectedBookingId && handleAction(selectedBookingId)}
                          >
                            Yes, cancel it
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setActionType('delete');
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this booking? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSelectedBookingId(null)}>
                            No, keep it
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => selectedBookingId && handleAction(selectedBookingId)}
                          >
                            Yes, delete it
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
