
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, DollarSign, Heart } from "lucide-react";
import type { Destination } from "@/types/models";

type SimplifiedDestination = Pick<
  Destination,
  "id" | "name" | "description" | "location" | "price" | "image_url"
>;

interface DestinationCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  id?: string;
  onClick?: () => void;
  showSimilar?: boolean;
  isInWishlist?: boolean;
  onWishlistToggle?: (id: string) => void;
  categories?: string[];
}

export const DestinationCard = ({
  image,
  title,
  description,
  price,
  id,
  onClick,
  showSimilar = false,
  isInWishlist = false,
  onWishlistToggle,
  categories = [],
}: DestinationCardProps) => {
  const navigate = useNavigate();
  const [similarDestinations, setSimilarDestinations] = useState<SimplifiedDestination[]>([]);
  const [showingSimilar, setShowingSimilar] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handleViewSimilar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && !showingSimilar) {
      const { data, error } = await supabase.rpc("get_similar_destinations", {
        destination_id: id,
      });

      if (!error && data) {
        setSimilarDestinations(data);
        setShowingSimilar(true);
      }
    } else {
      setShowingSimilar(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      // Navigate to the destination details page
      navigate(`/destination/${id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isInWishlist ? 'text-red-500' : 'text-white'} hover:bg-white/20`}
            onClick={handleWishlistClick}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-sm">
            <DollarSign className="h-4 w-4" />
            {price}
          </span>
          {categories.length > 0 && (
            <div className="flex gap-2">
              {categories.map((category, index) => (
                <span
                  key={index}
                  className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
        </div>

        <div className="flex gap-4">
          {showSimilar && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleViewSimilar}
            >
              {showingSimilar ? "Hide Similar" : "Show Similar"}
            </Button>
          )}
        </div>
      </div>

      {showingSimilar && similarDestinations.length > 0 && (
        <div className="p-4 bg-muted/50 border-t space-y-3">
          <h4 className="text-sm font-semibold">Similar Destinations</h4>
          <div className="space-y-3">
            {similarDestinations.map((dest) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/destination/${dest.id}`);
                }}
              >
                <img
                  src={dest.image_url || "/placeholder.svg"}
                  alt={dest.name}
                  className="w-16 h-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm truncate">{dest.name}</h5>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{dest.location}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">${dest.price}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
