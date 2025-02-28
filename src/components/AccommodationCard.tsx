
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, Home, Bed, Bath, Star } from "lucide-react";
import type { Accommodation } from "@/types/models";

interface AccommodationCardProps {
  accommodation: Accommodation;
  compact?: boolean;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  compact = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/accommodation/${accommodation.id}`);
  };

  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md ${compact ? 'h-full' : ''}`}
      onClick={handleClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={accommodation.image_url || "/placeholder.svg"}
          alt={accommodation.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {accommodation.rating && (
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {accommodation.rating}
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{accommodation.name}</h3>
            <p className="text-muted-foreground text-sm flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {accommodation.city}, {accommodation.country}
            </p>
          </div>
          <div className="bg-secondary px-2 py-1 rounded-full text-xs font-medium">
            {accommodation.accommodation_type}
          </div>
        </div>
        {!compact && (
          <p className="text-sm line-clamp-2 text-muted-foreground mt-2">
            {accommodation.description || "No description available."}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="bg-secondary/50 px-2 py-1 rounded-full text-xs flex items-center">
            <User className="h-3 w-3 mr-1" />
            {accommodation.max_guests} guests
          </div>
          <div className="bg-secondary/50 px-2 py-1 rounded-full text-xs flex items-center">
            <Home className="h-3 w-3 mr-1" />
            {accommodation.bedrooms} bedrooms
          </div>
          <div className="bg-secondary/50 px-2 py-1 rounded-full text-xs flex items-center">
            <Bed className="h-3 w-3 mr-1" />
            {accommodation.beds} beds
          </div>
          <div className="bg-secondary/50 px-2 py-1 rounded-full text-xs flex items-center">
            <Bath className="h-3 w-3 mr-1" />
            {accommodation.bathrooms} baths
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0">
        <div>
          <span className="font-bold text-lg">${accommodation.price_per_night}</span>
          <span className="text-muted-foreground text-sm"> / night</span>
        </div>
        <Button size="sm" variant="outline">View Details</Button>
      </CardFooter>
    </Card>
  );
};
