import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/types/models";

// Create a type for the simplified destination returned by the Supabase function
type SimplifiedDestination = Pick<Destination, 'id' | 'name' | 'description' | 'location' | 'price' | 'image_url'>;

interface DestinationCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  id?: string;
  onClick?: () => void;
  showSimilar?: boolean;
}

export const DestinationCard = ({ 
  image, 
  title, 
  description, 
  price, 
  id,
  onClick,
  showSimilar = false
}: DestinationCardProps) => {
  const navigate = useNavigate();
  const [similarDestinations, setSimilarDestinations] = useState<SimplifiedDestination[]>([]);
  const [showingSimilar, setShowingSimilar] = useState(false);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      window.open(`/destination/${id}`, '_blank');
    }
  };

  const handleViewSimilar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && !showingSimilar) {
      const { data, error } = await supabase
        .rpc('get_similar_destinations', { destination_id: id });
      
      if (!error && data) {
        setSimilarDestinations(data);
        setShowingSimilar(true);
      }
    } else {
      setShowingSimilar(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-primary shadow-sm">
            {price}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-display font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground line-clamp-3 mb-4 text-sm">
          {description}
        </p>
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-white text-primary hover:bg-primary hover:text-white border border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          {showSimilar && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleViewSimilar}
            >
              {showingSimilar ? 'Hide Similar' : 'Show Similar'}
            </Button>
          )}
        </div>
      </div>
      {showingSimilar && similarDestinations.length > 0 && (
        <div className="p-4 bg-muted/50 border-t">
          <h4 className="text-sm font-semibold mb-3">Similar Destinations</h4>
          <div className="space-y-3">
            {similarDestinations.map((dest) => (
              <div 
                key={dest.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/destination/${dest.id}`, '_blank');
                }}
              >
                <img 
                  src={dest.image_url || "/placeholder.svg"} 
                  alt={dest.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div>
                  <h5 className="font-medium text-sm">{dest.name}</h5>
                  <p className="text-xs text-muted-foreground">${dest.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};