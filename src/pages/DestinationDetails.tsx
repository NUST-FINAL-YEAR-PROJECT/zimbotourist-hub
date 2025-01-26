import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { DestinationCard } from "@/components/DestinationCard";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Star, ArrowLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  // Sample images array - in production this would come from your database
  const images = [
    destination?.image_url || "/placeholder.svg",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716",
  ];

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
      <div className="container mx-auto py-4 px-4 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container mx-auto py-4 px-4 text-center">
        <h1 className="text-xl font-bold mb-4">Destination not found</h1>
        <Button onClick={() => navigate("/dashboard/destinations")}>
          Back to Destinations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard/destinations")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {destination.name}
            </h1>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{destination.location}</span>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card overflow-hidden rounded-xl"
        >
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative h-[300px]"
                  >
                    <img
                      src={image}
                      alt={`${destination.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-4">
              <h3 className="text-lg font-display font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {destination.description}
              </p>
            </div>

            {destination.best_time_to_visit && (
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-display font-semibold">Best Time to Visit</h3>
                </div>
                <p className="text-sm text-muted-foreground">{destination.best_time_to_visit}</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {destination.activities && destination.activities.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-lg font-display font-semibold mb-2">Activities</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {destination.activities.map((activity, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-3 h-3 mr-1 text-primary" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {destination.amenities && destination.amenities.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-lg font-display font-semibold mb-2">Amenities</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {destination.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-3 h-3 mr-1 text-primary" />
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
          className="glass-card p-4 flex justify-between items-center"
        >
          <div>
            <p className="text-2xl font-display font-bold text-primary">${destination.price}</p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          <Button 
            onClick={() => navigate(`/booking/${destination.id}`)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Book Now
          </Button>
        </motion.div>

        {similarPlaces && similarPlaces.length > 0 && (
          <div className="pt-6">
            <h2 className="text-xl font-display font-bold mb-4">Similar Places</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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