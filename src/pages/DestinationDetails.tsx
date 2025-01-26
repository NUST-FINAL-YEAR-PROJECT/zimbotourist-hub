import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { DestinationCard } from "@/components/DestinationCard";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Star } from "lucide-react";

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2"
            >
              {destination.name}
            </motion.h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{destination.location}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard/destinations")}
            className="hover:bg-primary hover:text-white transition-colors"
          >
            Back to Destinations
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card overflow-hidden"
        >
          <div className="relative h-[400px]">
            <img
              src={destination.image_url || "/placeholder.svg"}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <h3 className="text-2xl font-display font-semibold mb-4">About this destination</h3>
              <p className="text-muted-foreground leading-relaxed">
                {destination.description}
              </p>
            </div>

            {destination.best_time_to_visit && (
              <div className="glass-card p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-xl font-display font-semibold">Best Time to Visit</h3>
                </div>
                <p className="text-muted-foreground">{destination.best_time_to_visit}</p>
              </div>
            )}

            {destination.duration_recommended && (
              <div className="glass-card p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-xl font-display font-semibold">Recommended Duration</h3>
                </div>
                <p className="text-muted-foreground">{destination.duration_recommended}</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {destination.activities && destination.activities.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-2xl font-display font-semibold mb-4">Activities</h3>
                <ul className="space-y-2">
                  {destination.activities.map((activity, index) => (
                    <li key={index} className="flex items-center text-muted-foreground">
                      <Star className="w-4 h-4 mr-2 text-primary" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {destination.amenities && destination.amenities.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-2xl font-display font-semibold mb-4">Amenities</h3>
                <ul className="space-y-2">
                  {destination.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center text-muted-foreground">
                      <Star className="w-4 h-4 mr-2 text-primary" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex justify-between items-center"
        >
          <div>
            <p className="text-3xl font-display font-bold text-primary">${destination.price}</p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
          <Button 
            onClick={() => navigate(`/booking/${destination.id}`)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold"
          >
            Book Now
          </Button>
        </motion.div>

        {similarPlaces && similarPlaces.length > 0 && (
          <div className="pt-12">
            <h2 className="text-3xl font-display font-bold mb-8">Similar Places</h2>
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
      </motion.div>
    </div>
  );
};