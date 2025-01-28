import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/types/models";

interface SimilarDestinationsProps {
  destinationId: string;
}

export const SimilarDestinations = ({ destinationId }: SimilarDestinationsProps) => {
  const { data: similarDestinations } = useQuery({
    queryKey: ["similar-destinations", destinationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_similar_destinations", { destination_id: destinationId });
      
      if (error) throw error;
      return data as Destination[];
    },
  });

  if (!similarDestinations?.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Similar Destinations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {similarDestinations.map((destination) => (
          <motion.a
            key={destination.id}
            href={`/destination/${destination.id}`}
            target="_blank"
            className="block group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={destination.image_url || "/placeholder.svg"}
                alt={destination.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-white font-semibold">{destination.name}</h3>
                <p className="text-white/80 text-sm">${destination.price}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};