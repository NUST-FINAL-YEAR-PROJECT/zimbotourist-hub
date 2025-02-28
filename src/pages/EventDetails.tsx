
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Calendar, Clock, Star, Activity, ArrowLeft, Home, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewSection } from "@/components/ReviewSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import type { Event } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { useAuth } from "@/hooks/useAuth";
import { EventBookingForm } from "@/components/EventBookingForm";

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Event not found");
      }

      return data as Event;
    },
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookNowClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    // Continue with existing booking flow
  };

  // Define onSuccess handler
  const handleBookingSuccess = () => {
    toast({
      title: "Success",
      description: "Booking created successfully!",
      variant: "default",
    });
    navigate("/dashboard/bookings");
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
        <h2 className="text-xl font-semibold">Event not found</h2>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Event not found</h2>
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold truncate">{event.title}</span>
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
                <BreadcrumbLink href="/events" className="hover:text-primary transition-colors">
                  Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {event.title}
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
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Event Info */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{event.location}</span>
                </div>
                {event.start_date && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{new Date(event.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {event.duration && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{event.duration}</span>
                  </div>
                )}
                {event.price && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{event.price}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">{event.description}</p>

              {/* Activities */}
              {event.activities && event.activities.length > 0 && (
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Activities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.activities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <Activity className="h-5 w-5 text-primary" />
                          <span className="font-medium">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Program Details */}
              {event.program_name && event.program_url && (
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Program Details
                    </h2>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <span className="font-medium">{event.program_name}</span>
                        <a href={event.program_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            View Program
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <ReviewSection destinationId={event.id} />
            </div>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-8">
            {/* Replace the booking section with conditional rendering */}
            {user ? (
              <EventBookingForm 
                event={event} 
                onSuccess={handleBookingSuccess} 
              />
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleBookNowClick}
                >
                  Book Now
                </Button>
                <AuthRequiredDialog 
                  isOpen={showAuthDialog} 
                  onClose={() => setShowAuthDialog(false)} 
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
