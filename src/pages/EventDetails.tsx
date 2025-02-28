
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  ChevronLeft, 
  Home, 
  Ticket,
  Clock,
  Share2,
  Tag,
  Info,
  ExternalLink,
  Calendar
} from "lucide-react";
import { EventBookingForm } from "@/components/EventBookingForm";
import { EventProgramUploader } from "@/components/EventProgramUploader";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useAuth } from "@/hooks/useAuth";
import type { Event } from "@/types/models";

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: event, isLoading } = useQuery({
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
    enabled: !!id,
  });

  // Sample image array - in a real app, this would come from the database
  const eventImages = event?.image_url 
    ? [
        event.image_url,
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
      ] 
    : [];

  const handleShare = () => {
    if (navigator.share && event) {
      navigator
        .share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Shared successfully");
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          // Fallback for desktop
          navigator.clipboard.writeText(window.location.href);
          toast.success("Link copied to clipboard!");
        });
    } else if (event) {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const isAdmin = user && user.email === "admin@example.com";

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <Button 
          variant="outline" 
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Event Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              {event.event_type && (
                <div className="flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {event.event_type}
                  </span>
                </div>
              )}
              
              {event.start_date && event.end_date && (
                <div className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2 text-green-500" />
                  <span>
                    {format(new Date(event.start_date), "PPP")} -{" "}
                    {format(new Date(event.end_date), "PPP")}
                  </span>
                </div>
              )}
              
              {event.start_date && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-500" />
                  <span>
                    {format(new Date(event.start_date), "h:mm a")} -{" "}
                    {event.end_date && format(new Date(event.end_date), "h:mm a")}
                  </span>
                </div>
              )}
              
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-500" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Image Carousel */}
          {eventImages.length > 0 && (
            <div className="rounded-xl overflow-hidden">
              <Carousel className="w-full">
                <CarouselContent>
                  {eventImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <img
                          src={image}
                          alt={`${event.title} - image ${index + 1}`}
                          className="w-full h-[400px] object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          )}

          {/* Event Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              About This Event
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description || "No description available for this event."}
              </p>
            </div>
          </div>

          {/* Event Program */}
          <EventProgramUploader 
            eventId={event.id} 
            existingProgramUrl={event.program_url}
            existingProgramName={event.program_name}
            existingProgramType={event.program_type}
            onUploadComplete={(url, fileName, fileType) => {
              console.log("Program uploaded:", url, fileName, fileType);
              // The actual update is handled within the uploader component
            }}
          />

          {/* Venue Information */}
          {event.venue_details && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                Venue Details
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {typeof event.venue_details === 'object' && event.venue_details.name && (
                      <p className="font-medium text-lg">{event.venue_details.name}</p>
                    )}
                    {typeof event.venue_details === 'object' && event.venue_details.address && (
                      <p className="text-gray-600">{event.venue_details.address}</p>
                    )}
                    {typeof event.venue_details === 'object' && event.venue_details.notes && (
                      <p className="text-sm text-gray-500 mt-2">{event.venue_details.notes}</p>
                    )}
                    {event.location && (
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center mt-2"
                      >
                        View on map
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Booking Section (Right Column) */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-xl flex items-center">
                  <Ticket className="w-5 h-5 mr-2 text-green-600" />
                  Booking Information
                </h3>
                
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="text-2xl font-bold">{event.price ? `$${event.price}` : "Free"}</span>
                  </div>
                </div>
                
                {event.start_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                    <div className="text-sm">
                      <p className="font-medium">Event Date:</p>
                      <p>{format(new Date(event.start_date), "EEEE, MMMM d, yyyy")}</p>
                    </div>
                  </div>
                )}
                
                {event.ticket_types && event.ticket_types.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Available Ticket Types:</h4>
                    <ScrollArea className="h-[120px]">
                      <div className="space-y-2">
                        {event.ticket_types.map((type: any, index: number) => (
                          <div key={index} className="flex justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium">{type.name}</p>
                              {type.description && <p className="text-xs text-gray-500">{type.description}</p>}
                            </div>
                            <span className="font-semibold">${type.price}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                
                {event.cancellation_policy && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Cancellation Policy:</p>
                    <p>{event.cancellation_policy}</p>
                  </div>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-6">Book Event</h2>
                      <EventBookingForm 
                        event={event}
                        onSuccess={() => navigate("/dashboard/bookings")}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
