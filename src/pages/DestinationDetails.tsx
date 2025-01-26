import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";

export const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const { data: profile } = useProfile(userId);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUserId();
  }, []);

  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("Please login to book");
      
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: profile.id,
          destination_id: id,
          booking_date: new Date().toISOString(),
          number_of_people: 1,
          total_price: destination?.price || 0,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Booking created",
        description: "Proceeding to payment...",
      });
      setIsBooking(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating booking",
        description: error.message,
      });
      setIsBooking(false);
    },
  });

  const handleBookNow = async () => {
    if (!profile) {
      toast({
        variant: "destructive",
        title: "Please login",
        description: "You need to be logged in to make a booking",
      });
      navigate("/auth");
      return;
    }

    setIsBooking(true);
    await createBooking.mutateAsync();
  };

  if (isLoading || !destination) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="h-[300px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  // Since we don't have additional_images in our type, we'll just use the main image
  const images = destination.image_url ? [destination.image_url] : [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="relative aspect-[16/9] w-full"
              >
                <img
                  src={image}
                  alt={`${destination.name} - Image ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-contain bg-black/5"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{destination.name}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              {destination.location}
            </div>
            <p className="text-muted-foreground">{destination.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {destination.activities && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Activities</h3>
                  <div className="flex flex-wrap gap-2">
                    {destination.activities.map((activity) => (
                      <Badge key={activity} variant="secondary">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {destination.amenities && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {destination.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="h-fit">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">${destination.price}</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(), "MMM d, yyyy")}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              {destination.what_to_bring && (
                <div>
                  <h3 className="font-semibold mb-2">What to Bring</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {destination.what_to_bring.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4">
                {isBooking ? (
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p>About to finish, proceed to payment...</p>
                    <a 
                      href="https://www.paynow.co.zw/Payment/BillPaymentLink/?q=aWQ9MTk4NTcmYW1vdW50PTAuMDAmYW1vdW50X3F1YW50aXR5PTAuMDAmbD0w" 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img 
                        src="https://www.paynow.co.zw/Content/Buttons/Medium_buttons/button_pay-now_medium.png" 
                        alt="Pay now with Paynow" 
                        className="mx-auto"
                      />
                    </a>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleBookNow}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};