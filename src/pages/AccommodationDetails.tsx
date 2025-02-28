
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAccommodation } from "@/hooks/useAccommodations";
import { 
  MapPin, Calendar, Clock, User, Home, Bed, Bath, Star, 
  Check, ArrowLeft, Coffee, Wifi, Tv, ChefHat, Car, Wind,
  UtensilsCrossed, Martini, Dumbbell, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AccommodationBookingForm } from "@/components/AccommodationBookingForm";

export const AccommodationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: accommodation, isLoading, error } = useAccommodation(id || "");

  const handleBack = () => {
    navigate(-1);
  };

  // Map accommodation amenity strings to appropriate icons
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes("breakfast") || amenityLower.includes("coffee")) return <Coffee className="h-4 w-4" />;
    if (amenityLower.includes("tv") || amenityLower.includes("television")) return <Tv className="h-4 w-4" />;
    if (amenityLower.includes("kitchen")) return <ChefHat className="h-4 w-4" />;
    if (amenityLower.includes("parking")) return <Car className="h-4 w-4" />;
    if (amenityLower.includes("air conditioning") || amenityLower.includes("ac")) return <Wind className="h-4 w-4" />;
    if (amenityLower.includes("restaurant") || amenityLower.includes("dining")) return <UtensilsCrossed className="h-4 w-4" />;
    if (amenityLower.includes("bar") || amenityLower.includes("lounge")) return <Martini className="h-4 w-4" />;
    if (amenityLower.includes("gym") || amenityLower.includes("fitness")) return <Dumbbell className="h-4 w-4" />;
    if (amenityLower.includes("pool") || amenityLower.includes("swimming")) return <Check className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !accommodation) {
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

  const images = [
    accommodation.image_url || "/placeholder.svg",
    ...(accommodation.additional_images || [])
  ].filter(Boolean);

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
            {/* Hero Image Carousel */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              {images.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-[16/9] w-full">
                          <img
                            src={image}
                            alt={`${accommodation.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <div className="aspect-[16/9] w-full">
                  <img
                    src={images[0]}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Accommodation Info */}
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">{accommodation.name}</h1>
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{accommodation.address}, {accommodation.city}, {accommodation.country}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  {accommodation.rating && (
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{accommodation.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Home className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{accommodation.accommodation_type}</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{accommodation.max_guests} guests</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Bed className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{accommodation.bedrooms} bedrooms, {accommodation.beds} beds</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Bath className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{accommodation.bathrooms} bathrooms</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{accommodation.description}</p>

              {/* Amenities */}
              {accommodation.amenities && accommodation.amenities.length > 0 && (
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      Amenities
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {accommodation.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="font-medium text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Policies */}
              {accommodation.policies && Object.keys(accommodation.policies).length > 0 && (
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">House Rules & Policies</h2>
                    <div className="space-y-4">
                      {Object.entries(accommodation.policies).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <h3 className="font-medium capitalize">{key.replace(/_/g, ' ')}</h3>
                          <p className="text-sm text-muted-foreground">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Check-in and Check-out */}
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Check-in & Check-out</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Check-in</h3>
                      </div>
                      <p>{accommodation.check_in_time ? new Date(`2000-01-01T${accommodation.check_in_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '3:00 PM'}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowLeft className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Check-out</h3>
                      </div>
                      <p>{accommodation.check_out_time ? new Date(`2000-01-01T${accommodation.check_out_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '11:00 AM'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Host Information */}
              {accommodation.host_name && (
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">About Your Host</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{accommodation.host_name}</h3>
                        {accommodation.host_response_time && (
                          <p className="text-sm text-muted-foreground">
                            Response time: {accommodation.host_response_time}
                          </p>
                        )}
                        {accommodation.host_response_rate && (
                          <p className="text-sm text-muted-foreground">
                            Response rate: {accommodation.host_response_rate}%
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-8">
            {/* Booking Card */}
            <Card className="border-none shadow-lg sticky top-20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold text-primary">${accommodation.price_per_night}</h3>
                      <p className="text-sm text-muted-foreground">per night</p>
                    </div>
                    {accommodation.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-medium">{accommodation.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Book Your Stay</h2>
                        {accommodation && (
                          <AccommodationBookingForm 
                            accommodation={accommodation}
                            onSuccess={() => navigate("/dashboard/bookings")}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="text-sm text-muted-foreground space-y-2 bg-secondary/30 p-4 rounded-lg">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {accommodation.min_nights && accommodation.min_nights > 1 ? 
                        `Minimum stay: ${accommodation.min_nights} nights` : 
                        'No minimum stay requirement'}
                    </p>
                    {accommodation.cleaning_fee && accommodation.cleaning_fee > 0 && (
                      <p className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Cleaning fee: ${accommodation.cleaning_fee}
                      </p>
                    )}
                    {accommodation.service_fee && accommodation.service_fee > 0 && (
                      <p className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Service fee: ${accommodation.service_fee}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Free cancellation up to 24 hours before check-in
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
