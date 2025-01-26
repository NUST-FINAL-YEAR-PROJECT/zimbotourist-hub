import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { DestinationCard } from "@/components/DestinationCard";

export const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: similarPlaces } = useQuery({
    queryKey: ["similar-destinations", destination?.location],
    queryFn: async () => {
      if (!destination) return [];
      
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .neq("id", destination.id)
        .eq("location", destination.location)
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!destination,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
        <Button onClick={() => navigate("/dashboard/destinations")}>
          Back to Destinations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{destination.name}</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard/destinations")}>
            Back to Destinations
          </Button>
        </div>

        <div className="max-h-[500px] relative rounded-lg overflow-hidden">
          <img
            src={destination.image_url || "/placeholder.svg"}
            alt={destination.name}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{destination.description}</p>
            </div>

            {destination.best_time_to_visit && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Best Time to Visit</h3>
                <p className="text-muted-foreground">{destination.best_time_to_visit}</p>
              </div>
            )}

            {destination.duration_recommended && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Recommended Duration</h3>
                <p className="text-muted-foreground">{destination.duration_recommended}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {destination.activities && destination.activities.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Activities</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {destination.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}

            {destination.amenities && destination.amenities.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Amenities</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {destination.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <div>
            <p className="text-2xl font-semibold">${destination.price}</p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
          <Button onClick={() => navigate(`/booking/${destination.id}`)}>
            Book Now
          </Button>
        </div>

        {similarPlaces && similarPlaces.length > 0 && (
          <div className="pt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Places</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarPlaces.map((place) => (
                <DestinationCard
                  key={place.id}
                  id={place.id}
                  image={place.image_url || "/placeholder.svg"}
                  title={place.name}
                  description={place.description || ""}
                  price={`$${place.price}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};