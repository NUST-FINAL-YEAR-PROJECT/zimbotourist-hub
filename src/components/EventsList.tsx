
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useEvents } from "@/hooks/useEvents";
import type { Event } from "@/types/models";

export const EventsList = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, error } = useEvents();

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error loading events</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events?.map((event) => (
        <DestinationCard
          key={event.id}
          id={event.id}
          image={event.image_url || "/placeholder.svg"}
          title={event.title}
          description={event.description || ""}
          price={event.price ? `$${event.price}` : "Free"}
          onClick={() => navigate(`/events/${event.id}`)}
        />
      ))}
    </div>
  );
};
