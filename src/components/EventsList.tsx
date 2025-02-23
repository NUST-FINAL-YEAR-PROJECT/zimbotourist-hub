
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useEvents } from "@/hooks/useEvents";
import type { Event } from "@/types/models";

export const EventsList = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, error } = useEvents();

  if (isLoading) {
    return <div className="p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading events: {error.message}</div>;
  }

  if (!events?.length) {
    return <div className="p-4">No events found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <DestinationCard
          key={event.id}
          id={event.id}
          image={event.image_url || "/placeholder.svg"}
          title={event.title}
          description={event.description || ""}
          price={event.price ? `$${event.price}` : "Free"}
          onClick={() => navigate(`/dashboard/event/${event.id}`)}
        />
      ))}
    </div>
  );
};
