import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Check, X, ExternalLink } from "lucide-react";
import type { BookingWithRelations } from "@/types/models";

export const BookingManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);

  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          events(title, image_url),
          destinations(name, image_url)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Fetched bookings:", data);
      return data as BookingWithRelations[];
    },
  });

  const confirmBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "confirmed", 
          confirmation_date: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({
        title: "Booking confirmed",
        description: "The booking has been successfully confirmed.",
      });
      setIsConfirmDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to confirm booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "cancelled", 
          cancellation_date: new Date().toISOString(),
          cancellation_reason: "Cancelled by administrator" 
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({
        title: "Booking cancelled",
        description: "The booking has been cancelled.",
      });
      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to cancel booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (booking: BookingWithRelations) => {
    console.log("Viewing booking details:", booking);
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleConfirmClick = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setIsConfirmDialogOpen(true);
  };

  const handleCancelClick = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setIsCancelDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Booking Management</CardTitle>
        <CardDescription>
          View and manage all customer bookings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingBookings ? (
          <div className="flex justify-center py-8">
            <p>Loading bookings...</p>
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No bookings found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Contact Name</TableHead>
                  <TableHead>Event/Destination</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.split("-")[0]}...
                    </TableCell>
                    <TableCell>{booking.contact_name}</TableCell>
                    <TableCell>
                      {booking.events?.title || booking.destinations?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {booking.booking_date ? (
                        format(new Date(booking.booking_date), "MMM d, yyyy")
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status || "pending")}</TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(booking.payment_status || "pending")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(booking)}
                        >
                          View
                        </Button>
                        {booking.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100"
                              onClick={() => handleConfirmClick(booking)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 hover:bg-red-100"
                              onClick={() => handleCancelClick(booking)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* View Booking Dialog */}
        <Dialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                View detailed information about this booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Contact Information</h3>
                    <p>Name: {selectedBooking.contact_name}</p>
                    <p>Email: {selectedBooking.contact_email}</p>
                    <p>Phone: {selectedBooking.contact_phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Booking Information</h3>
                    <p>Status: {getStatusBadge(selectedBooking.status || "pending")}</p>
                    <p>People: {selectedBooking.number_of_people}</p>
                    <p>Total Price: ${selectedBooking.total_price}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Timeline</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <p>Created: {format(new Date(selectedBooking.created_at), "MMM d, yyyy HH:mm")}</p>
                    {selectedBooking.confirmation_date && (
                      <p>Confirmed: {format(new Date(selectedBooking.confirmation_date), "MMM d, yyyy HH:mm")}</p>
                    )}
                    {selectedBooking.cancellation_date && (
                      <p>Cancelled: {format(new Date(selectedBooking.cancellation_date), "MMM d, yyyy HH:mm")}</p>
                    )}
                  </div>
                </div>

                {selectedBooking.booking_details && (
                  <div>
                    <h3 className="font-medium">Additional Details</h3>
                    <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
                      {JSON.stringify(selectedBooking.booking_details, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedBooking.payment_proof_url && (
                  <div>
                    <h3 className="font-medium">Payment Proof</h3>
                    <div className="mt-2 border rounded-md p-4 bg-muted/30">
                      {/* Display image if it's an image type URL */}
                      {selectedBooking.payment_proof_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <div className="flex flex-col gap-2">
                          <img 
                            src={selectedBooking.payment_proof_url} 
                            alt="Payment Proof" 
                            className="max-w-full h-auto max-h-64 rounded"
                          />
                          <a 
                            href={selectedBooking.payment_proof_url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Full Size
                          </a>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <a 
                            href={selectedBooking.payment_proof_url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Payment Proof Document
                          </a>
                        </div>
                      )}
                      
                      {selectedBooking.payment_proof_uploaded_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Uploaded: {format(new Date(selectedBooking.payment_proof_uploaded_at), "MMM d, yyyy HH:mm")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirm Booking Dialog */}
        <AlertDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to confirm this booking? This action will notify the customer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => selectedBooking && confirmBooking.mutate(selectedBooking.id)}
              >
                {confirmBooking.isPending ? "Confirming..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Booking Dialog */}
        <AlertDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={() => selectedBooking && cancelBooking.mutate(selectedBooking.id)}
              >
                {cancelBooking.isPending ? "Cancelling..." : "Yes, Cancel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
