
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingWithRelations, AccommodationBooking } from "@/types/models";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedAccommodationBookingId, setSelectedAccommodationBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("destinations");

  const form = useForm<PaymentProofForm>({
    resolver: zodResolver(paymentProofSchema),
  });

  // Regular bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
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

  // Accommodation bookings
  const { data: accommodationBookings = [], isLoading: isLoadingAccommodationBookings } = useQuery({
    queryKey: ["accommodation_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodation_bookings")
        .select(`
          *,
          accommodation:accommodation_id (name, image_url)
        `)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      return data as (AccommodationBooking & {
        accommodation: { name: string; image_url: string | null }
      })[];
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

  const uploadAccommodationPaymentProof = useMutation({
    mutationFn: async ({ bookingId, file }: { bookingId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `accommodation_${bookingId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('accommodation_bookings')
        .update({
          payment_status: 'processing'
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      return filePath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodation_bookings"] });
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
    } else if (selectedAccommodationBookingId) {
      await uploadAccommodationPaymentProof.mutate({
        bookingId: selectedAccommodationBookingId,
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

  const deleteAccommodationBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("accommodation_bookings")
        .delete()
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodation_bookings"] });
      toast({
        title: "Accommodation booking deleted",
        description: "Your accommodation booking has been successfully deleted."
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

  const cancelAccommodationBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("accommodation_bookings")
        .update({ 
          status: 'cancelled',
          cancellation_date: new Date().toISOString()
        })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodation_bookings"] });
      toast({
        title: "Accommodation booking cancelled",
        description: "Your accommodation booking has been successfully cancelled."
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
      if (activeTab === 'destinations') {
        deleteBookingMutation.mutate(bookingId);
      } else {
        deleteAccommodationBookingMutation.mutate(bookingId);
      }
    } else if (actionType === 'cancel') {
      if (activeTab === 'destinations') {
        cancelBookingMutation.mutate(bookingId);
      } else {
        cancelAccommodationBookingMutation.mutate(bookingId);
      }
    }
    setSelectedBookingId(null);
    setSelectedAccommodationBookingId(null);
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

  const isLoading = isLoadingBookings || isLoadingAccommodationBookings;

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

  const noBookings = bookings.length === 0 && accommodationBookings.length === 0;

  if (noBookings) {
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="destinations">Destinations & Events</TabsTrigger>
          <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="destinations" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-muted-foreground">No destination or event bookings found</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
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
                                  setSelectedAccommodationBookingId(null);
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
            ))
          )}
        </TabsContent>

        <TabsContent value="accommodations" className="space-y-4">
          {accommodationBookings.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-muted-foreground">No accommodation bookings found</p>
              </CardContent>
            </Card>
          ) : (
            accommodationBookings.map((booking) => (
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
                            {booking.accommodation?.name}
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
                          Check-in: {new Date(booking.check_in_date).toLocaleDateString()} | 
                          Check-out: {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          {booking.number_of_guests} {booking.number_of_guests === 1 ? 'guest' : 'guests'} • 
                          ${booking.total_price.toFixed(2)}
                        </p>
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
                                  setSelectedAccommodationBookingId(booking.id);
                                  setSelectedBookingId(null);
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
                                      disabled={uploadAccommodationPaymentProof.isPending}
                                    >
                                      {uploadAccommodationPaymentProof.isPending ? "Uploading..." : "Upload"}
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
                                    setSelectedAccommodationBookingId(booking.id);
                                    setActionType('cancel');
                                  }}
                                >
                                  <BanIcon className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Accommodation Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this accommodation booking? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setSelectedAccommodationBookingId(null)}>
                                    No, keep it
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => selectedAccommodationBookingId && handleAction(selectedAccommodationBookingId)}
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
                                    setSelectedAccommodationBookingId(booking.id);
                                    setActionType('delete');
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Accommodation Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this accommodation booking? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setSelectedAccommodationBookingId(null)}>
                                    No, keep it
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => selectedAccommodationBookingId && handleAction(selectedAccommodationBookingId)}
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
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
