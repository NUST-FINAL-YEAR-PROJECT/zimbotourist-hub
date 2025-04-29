
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, DollarSign, Heart, Calendar, Clock, Star, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  location?: string;
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
  location,
}: DestinationCardProps) => {
  const navigate = useNavigate();
  const [similarDestinations, setSimilarDestinations] = useState<SimplifiedDestination[]>([]);
  const [showingSimilar, setShowingSimilar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handleViewSimilar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (id && !showingSimilar) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_similar_destinations", {
          destination_id: id,
        });

        if (!error && data) {
          setSimilarDestinations(data);
          setShowingSimilar(true);
        }
      } catch (error) {
        console.error("Error fetching similar destinations:", error);
      } finally {
        setIsLoading(false);
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
      whileHover={{ y: -5 }}
      className="group overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 h-full flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Heart icon for wishlist */}
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors",
              isInWishlist ? "text-red-500" : "text-white"
            )}
            onClick={handleWishlistClick}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        {/* Price tag */}
        <div className="absolute bottom-3 left-3">
          <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-primary shadow-sm">
            <DollarSign className="h-4 w-4" />
            {price}
          </div>
        </div>
        
        {/* Categories */}
        {categories.length > 0 && (
          <div className="absolute bottom-3 right-3 flex gap-2 max-w-[60%] flex-wrap justify-end">
            {categories.slice(0, 2).map((category, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm"
              >
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm"
              >
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-1 text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-1">
          {title}
        </h3>
        
        {location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>
        
        <div className="mt-auto space-y-4">
          {(duration || bestTimeToVisit) && (
            <div className="flex flex-wrap gap-2">
              {duration && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-2.5 py-1.5 rounded-md">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {duration}
                </div>
              )}
              {bestTimeToVisit && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-2.5 py-1.5 rounded-md">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {bestTimeToVisit}
                </div>
              )}
            </div>
          )}
          
          {showSimilar && (
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300 gap-1.5"
              onClick={handleViewSimilar}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : showingSimilar ? (
                <>Hide Similar <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show Similar <ChevronDown className="h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Similar destinations section */}
      {showingSimilar && similarDestinations.length > 0 && (
        <div className="p-4 space-y-3 border-t border-gray-100 bg-gray-50/80">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-primary" />
            Similar Destinations
          </h4>
          <div className="space-y-2">
            {similarDestinations.map((dest) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer"
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
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{dest.location}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-sm font-medium text-primary">
                  ${dest.price}
                  <ExternalLink className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
