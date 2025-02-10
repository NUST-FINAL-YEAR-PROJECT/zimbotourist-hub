
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Users, ChevronLeft, Home } from "lucide-react";
import { EventBookingForm } from "@/components/EventBookingForm";
import type { Event } from "@/types/models";

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            {event.start_date && event.end_date && (
              <div className="flex items-center">
                <CalendarDays className="w-5 h-5 mr-2" />
                <span>
                  {format(new Date(event.start_date), "PPP")} -{" "}
                  {format(new Date(event.end_date), "PPP")}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        )}

        <div className="prose max-w-none">
          <p>{event.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Price</h3>
            <p className="text-2xl font-bold">{event.price ? `$${event.price}` : "Free"}</p>
          </div>

          {event.ticket_types && event.ticket_types.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-2">Ticket Types</h3>
              <ul className="space-y-2">
                {event.ticket_types.map((type: any, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>{type.name}</span>
                    <span className="font-medium">${type.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {event.event_type && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-2">Event Type</h3>
              <p>{event.event_type}</p>
            </div>
          )}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto">
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
    </div>
  );
};
