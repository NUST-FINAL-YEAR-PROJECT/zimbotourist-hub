
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bed, Bath, Users, MapPin } from "lucide-react";
import type { Accommodation } from "@/types/models";

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export const AccommodationCard = ({ accommodation }: AccommodationCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="h-full flex flex-col">
      <div className="aspect-[16/9] relative overflow-hidden rounded-t-lg">
        <img
          src={accommodation.image_url || "/placeholder.svg"}
          alt={accommodation.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            {accommodation.name}
          </h3>
          {accommodation.destinations && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {accommodation.destinations.name}, {accommodation.destinations.location}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-primary" />
            <span className="text-sm">{accommodation.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-primary" />
            <span className="text-sm">{accommodation.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">{accommodation.max_guests} Guests</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {accommodation.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-lg font-bold">
          ${accommodation.price_per_night}
          <span className="text-sm font-normal text-muted-foreground">/night</span>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate(`/accommodation/${accommodation.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
