
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Destination } from "@/types/models";

interface SimilarDestinationsProps {
  destinationId: string;
}

export const SimilarDestinations = ({ destinationId }: SimilarDestinationsProps) => {
  const navigate = useNavigate();
  
  const { data: similarDestinations, isLoading } = useQuery({
    queryKey: ["similar-destinations", destinationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_similar_destinations", { destination_id: destinationId });
      
      if (error) throw error;
      return data as Destination[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Similar Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!similarDestinations?.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">You Might Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {similarDestinations.map((destination) => (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
            onClick={() => navigate(`/destination/${destination.id}`)}
          >
            <div className="relative aspect-[4/3]">
              <img
                src={destination.image_url || "/placeholder.svg"}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold line-clamp-1">{destination.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-xs text-white/90">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{destination.location}</span>
                  </div>
                  <span className="text-sm font-medium text-white">${destination.price}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <Button 
          variant="ghost" 
          className="text-sm flex items-center gap-1.5 text-primary"
          onClick={() => navigate('/destinations')}
        >
          Browse More Destinations
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
