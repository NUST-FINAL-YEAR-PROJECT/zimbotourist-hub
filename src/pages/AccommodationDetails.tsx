
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Calendar, Clock, Star, Activity, ArrowLeft, Home, Hotel } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingForm } from "@/components/BookingForm";
import { ReviewSection } from "@/components/ReviewSection";
import { SimilarDestinations } from "@/components/SimilarDestinations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAccommodations } from "@/hooks/useAccommodations";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Destination } from "@/types/models";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { useAuth } from "@/hooks/useAuth";
import { AccommodationBookingForm } from "@/components/AccommodationBookingForm";
import type { Accommodation } from "@/types/models";

export const AccommodationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: accommodation, isLoading, error } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching accommodation:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Accommodation not found");
      }

      return data as Accommodation;
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
        <h2 className="text-xl font-semibold">Accommodation not found</h2>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Accommodation not found</h2>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const handleBookNowClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    // Continue with existing booking flow
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold truncate">{accommodation.name}</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 mt-14 md:mt-8 max-w-7xl">
        {/* Breadcrumb Navigation - Hidden on Mobile */}
        <div className="mb-6 hidden md:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="hover:text-primary transition-colors">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/accommodations" className="hover:text-primary transition-colors">
                  Accommodations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {accommodation.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
              <img
                src={accommodation.image_url || "/placeholder.svg"}
                alt={accommodation.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Accommodation Info */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{accommodation.name}</h1>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{accommodation.location}</span>
                </div>
                {accommodation.max_guests && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Max Guests: {accommodation.max_guests}</span>
                  </div>
                )}
                {accommodation.bedrooms && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{accommodation.bedrooms} Bedrooms</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">{accommodation.description}</p>

              {/* Amenities */}
              {accommodation.amenities && accommodation.amenities.length > 0 && (
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Amenities
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {accommodation.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <Star className="h-4 w-4 text-primary" />
                          <span className="font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <ReviewSection accommodationId={accommodation.id} />
            </div>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-8">
            {/* Booking Dialog */}
            <Card className="border-none shadow-lg sticky top-20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold text-primary">${accommodation.price_per_night}</h3>
                      <p className="text-sm text-muted-foreground">per night</p>
                    </div>
                  </div>
                  
                  {user ? (
                    <AccommodationBookingForm accommodation={accommodation} />
                  ) : (
                    <>
                      <Button size="lg" className="w-full" onClick={handleBookNowClick}>
                        Book Now
                      </Button>
                      <AuthRequiredDialog 
                        isOpen={showAuthDialog} 
                        onClose={() => setShowAuthDialog(false)} 
                      />
                    </>
                  )}

                  <div className="text-sm text-muted-foreground space-y-2 bg-secondary/30 p-4 rounded-lg">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Free cancellation up to 24 hours before departure
                    </p>
                    <p className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Instant confirmation
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Expert local guides
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Destinations */}
            <SimilarDestinations destinationId={accommodation?.destination_id} />
          </div>
        </div>
      </div>
    </div>
  );
};
