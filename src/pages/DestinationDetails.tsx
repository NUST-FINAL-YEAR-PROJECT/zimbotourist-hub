import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Star, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingForm } from "@/components/BookingForm";
import { ReviewSection } from "@/components/ReviewSection";
import { SimilarDestinations } from "@/components/SimilarDestinations";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/types/models";

export const DestinationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Destination;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!destination) {
    return <div>Destination not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={destination.image_url || "/placeholder.svg"}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Destination Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{destination.name}</h1>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{destination.location}</span>
              </div>
              {destination.best_time_to_visit && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>{destination.best_time_to_visit}</span>
                </div>
              )}
              {destination.duration_recommended && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>{destination.duration_recommended}</span>
                </div>
              )}
            </div>

            <p className="text-gray-600">{destination.description}</p>

            {/* Activities */}
            {destination.activities && destination.activities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Activities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {destination.activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg bg-gray-50"
                      >
                        <Activity className="h-5 w-5 text-primary" />
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {destination.amenities && destination.amenities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {destination.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <Star className="h-4 w-4 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <ReviewSection destinationId={destination.id} />
          </div>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-8">
          {/* Booking Form */}
          <Card>
            <CardContent className="pt-6">
              <BookingForm 
                destination={destination}
                onSuccess={() => {
                  toast({
                    title: "Booking successful",
                    description: "Your booking has been confirmed.",
                  });
                }}
              />
            </CardContent>
          </Card>

          {/* Similar Destinations */}
          <SimilarDestinations destinationId={destination.id} />
        </div>
      </div>
    </div>
  );
};