
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, DollarSign, Heart, Calendar, Clock, Star } from "lucide-react";
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
  duration?: string;
  bestTimeToVisit?: string;
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
  duration,
  bestTimeToVisit,
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
      className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isInWishlist ? 'text-red-500' : 'text-white'} hover:bg-white/20 backdrop-blur-sm`}
            onClick={handleWishlistClick}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-primary shadow-sm">
            <DollarSign className="h-4 w-4" />
            {price}
          </span>
          {categories.length > 0 && (
            <div className="flex gap-2">
              {categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium"
                >
                  {category}
                </span>
              ))}
              {categories.length > 2 && (
                <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                  +{categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{description}</p>
        </div>
        
        {(duration || bestTimeToVisit) && (
          <div className="flex flex-wrap gap-3 mt-2">
            {duration && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-3 py-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {duration}
              </span>
            )}
            {bestTimeToVisit && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-3 py-1.5 rounded-full">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {bestTimeToVisit}
              </span>
            )}
          </div>
        )}

        {showSimilar && (
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="w-full bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300"
              onClick={handleViewSimilar}
            >
              {showingSimilar ? "Hide Similar" : "Show Similar"}
            </Button>
          </div>
        )}
      </div>

      {/* Similar destinations section */}
      {showingSimilar && similarDestinations.length > 0 && (
        <div className="p-4 space-y-3 border-t border-gray-100 bg-gray-50/50">
          <h4 className="text-sm font-semibold text-gray-900">Similar Destinations</h4>
          <div className="space-y-2">
            {similarDestinations.map((dest) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/destination/${dest.id}`);
                }}
              >
                <img
                  src={dest.image_url || "/placeholder.svg"}
                  alt={dest.name}
                  className="w-16 h-12 rounded-lg object-cover"
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
