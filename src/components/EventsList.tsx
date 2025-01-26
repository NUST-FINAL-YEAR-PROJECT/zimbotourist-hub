import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import type { Event } from "@/types/models";

export const EventsList = ({ events }: { events: Event[] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events?.map((event) => (
        <div key={event.id} onClick={() => navigate(`/dashboard/events/${event.id}`)}>
          <DestinationCard
            id={event.id}
            image={event.image_url || "/placeholder.svg"}
            title={event.title}
            description={event.description || ""}
            price={`$${event.price}`}
          />
        </div>
      ))}
    </div>
  );
};