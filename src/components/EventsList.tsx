
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/types/models";

export const EventsList = () => {
  const navigate = useNavigate();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      return data as Event[];
    },
  });

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error loading events</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events?.map((event) => (
        <div 
          key={event.id} 
          className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105"
          onClick={() => navigate(`/events/${event.id}`)}
        >
          <DestinationCard
            id={event.id}
            image={event.image_url || "/placeholder.svg"}
            title={event.title}
            description={event.description || ""}
            price={event.price ? `$${event.price}` : "Free"}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span className="text-primary font-medium">View Details</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
