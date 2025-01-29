import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, ArrowLeft } from "lucide-react";
import { EventBookingForm } from "@/components/EventBookingForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

      if (error) throw error;
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{event.title}</h1>
      </div>

      <div className="flex items-center space-x-4 text-gray-600">
        <div className="flex items-center">
          <CalendarDays className="w-5 h-5 mr-2" />
          <span>
            {format(new Date(event.start_date), "PPP")} -{" "}
            {format(new Date(event.end_date), "PPP")}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{event.location}</span>
          </div>
        )}
        {event.capacity && (
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span>{event.capacity} attendees max</span>
          </div>
        )}
      </div>

      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}

      <div className="prose max-w-none">
        <p>{event.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">Price</h3>
          <p className="text-2xl font-bold">${event.price}</p>
        </div>

        {event.ticket_types && event.ticket_types.length > 0 && (
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Ticket Types</h3>
            <ul className="space-y-2">
              {event.ticket_types.map((type: any, index: number) => (
                <li key={index}>{type.name}</li>
              ))}
            </ul>
          </div>
        )}

        {event.cancellation_policy && (
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Cancellation Policy</h3>
            <p>{event.cancellation_policy}</p>
          </div>
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full md:w-auto">
            Book Now
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <EventBookingForm event={event} onSuccess={() => navigate("/dashboard/bookings")} />
        </DialogContent>
      </Dialog>
    </div>
  );
};