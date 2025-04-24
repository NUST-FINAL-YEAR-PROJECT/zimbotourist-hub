
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingWithRelations } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash2, BanIcon, Upload, CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const paymentProofSchema = z.object({
  proof: z.instanceof(FileList).refine((files) => files.length > 0, "Please select a file")
    .transform(files => files[0])
    .refine(
      (file) => file.size <= 5000000,
      "File size should be less than 5MB"
    )
    .refine(
      (file) => 
        ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
      "File must be an image (JPEG, PNG, WEBP) or PDF"
    ),
});

type PaymentProofForm = z.infer<typeof paymentProofSchema>;

export const MyBookings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"delete" | "cancel" | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const form = useForm<PaymentProofForm>({
    resolver: zodResolver(paymentProofSchema),
  });

  // Regular bookings
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

  const uploadPaymentProof = useMutation({
    mutationFn: async ({ bookingId, file }: { bookingId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${bookingId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_proof_url: filePath,
          payment_proof_uploaded_at: new Date().toISOString(),
          payment_status: 'processing'
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      return filePath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Proof of payment uploaded",
        description: "Your proof of payment has been submitted successfully."
      });
      setUploadDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const onSubmitProof = async (data: PaymentProofForm) => {
    if (selectedBookingId) {
      await uploadPaymentProof.mutate({
        bookingId: selectedBookingId,
        file: data.proof
      });
    }
  };

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

  const handlePayNow = () => {
    const baseUrl = 'https://www.paynow.co.zw/Payment/BillPaymentLink/?q=aWQ9MTk4ODMmYW1vdW50PTAuMDAmYW1vdW50X3F1YW50aXR5PTAuMDAmbD0w';
    window.open(baseUrl, '_blank');
  };

  const showPaymentButton = (status: string) => {
    return status === 'pending' || status === 'failed';
  };

  const showUploadButton = (status: string, paymentStatus: string) => {
    return status === 'pending' || paymentStatus === 'pending' || paymentStatus === 'failed';
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

  if (bookings.length === 0) {
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
      
      <div className="space-y-4">
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
                      {booking.payment_proof_url && (
                        <Badge variant="outline" className="ml-2">
                          Proof Submitted
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Booked for: {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      {booking.number_of_people} {booking.number_of_people === 1 ? 'person' : 'people'} • 
                      ${booking.total_price.toFixed(2)}
                    </p>
                    {booking.payment_proof_uploaded_at && (
                      <p className="text-sm text-muted-foreground">
                        Payment proof submitted on: {new Date(booking.payment_proof_uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 self-start">
                    {showPaymentButton(booking.payment_status) && (
                      <Button
                        variant="default"
                        size={isMobile ? "sm" : "default"}
                        className="bg-[#008CBA] hover:bg-[#005f7f] text-white"
                        onClick={handlePayNow}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    )}

                    {showUploadButton(booking.status, booking.payment_status) && (
                      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size={isMobile ? "sm" : "default"}
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setSelectedBookingId(booking.id);
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Proof
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Payment Proof</DialogTitle>
                            <DialogDescription>
                              Upload your proof of payment (PDF or image). Maximum file size is 5MB.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitProof)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="proof"
                                render={({ field: { onChange, value, ...field } }) => (
                                  <FormItem>
                                    <FormLabel>Proof of Payment</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={(e) => {
                                          onChange(e.target.files);
                                        }}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Accepted formats: PDF, JPEG, PNG, WEBP
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setUploadDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit"
                                  disabled={uploadPaymentProof.isPending}
                                >
                                  {uploadPaymentProof.isPending ? "Uploading..." : "Upload"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}

                    {booking.status !== 'cancelled' && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
