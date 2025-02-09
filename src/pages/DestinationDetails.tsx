
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Star, Activity, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingForm } from "@/components/BookingForm";
import { ReviewSection } from "@/components/ReviewSection";
import { SimilarDestinations } from "@/components/SimilarDestinations";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import type { Destination } from "@/types/models";

export const DestinationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: destination, isLoading, error } = useQuery({
    queryKey: ["destination", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching destination:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Destination not found");
      }

      return data as Destination;
    },
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Destination not found</h2>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Destination not found</h2>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold truncate">{destination.name}</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 mt-14 md:mt-0">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" icon={<Home className="h-4 w-4" />}>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/destinations">
                Destinations
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href={`/destination/${destination.id}`}>
                {destination.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

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
                    // Navigate to dashboard after successful booking
                    navigate('/dashboard/bookings');
                  }}
                />
              </CardContent>
            </Card>

            {/* Similar Destinations */}
            <SimilarDestinations destinationId={destination.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

