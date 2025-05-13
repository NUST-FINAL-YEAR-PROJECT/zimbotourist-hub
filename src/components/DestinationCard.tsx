import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Heart, Calendar, Clock, Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/models";
import { useToast } from "@/hooks/use-toast";

interface DestinationCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  id?: string;
  onClick?: () => void;
  showSimilar?: boolean;  // Kept for backward compatibility but will no longer be used
  isInWishlist?: boolean;
  onWishlistToggle?: (id: string) => void;
  categories?: string[];
  duration?: string;
  bestTimeToVisit?: string;
  location?: string;
  paymentUrl?: string;  // New prop for external payment URL
}

export const DestinationCard = ({
  image,
  title,
  description,
  price,
  id,
  onClick,
  isInWishlist = false,
  onWishlistToggle,
  categories = [],
  duration,
  bestTimeToVisit,
  location,
  paymentUrl,
}: DestinationCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      navigate(`/destination/${id}`);
    }
  };

  const handlePaymentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    if (paymentUrl) {
      // Open in a new tab
      window.open(paymentUrl, '_blank');
      
      toast({
        title: "Redirecting to payment",
        description: "You're being redirected to complete your payment.",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 h-full flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Heart icon for wishlist */}
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-colors",
              isInWishlist ? "text-red-500" : "text-white"
            )}
            onClick={handleWishlistClick}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        {/* Price tag */}
        <div className="absolute bottom-3 left-3">
          <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold text-primary shadow-sm">
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
        <h3 className="text-xl font-semibold mb-1.5 text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-1">
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
        
        <div className="mt-auto flex flex-wrap gap-2">
          {duration && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {duration}
            </div>
          )}
          {bestTimeToVisit && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {bestTimeToVisit}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 px-2.5 py-1.5 rounded-lg">
            <Star className="h-3.5 w-3.5 text-primary" />
            View Details
          </div>
          
          {/* Payment button - only shown when paymentUrl is available */}
          {paymentUrl && (
            <Button 
              variant="outline"
              size="sm"
              className="ml-auto mt-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 gap-1.5"
              onClick={handlePaymentClick}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Pay Now
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
