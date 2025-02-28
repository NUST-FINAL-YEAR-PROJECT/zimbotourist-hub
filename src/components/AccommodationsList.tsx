
import { useAccommodations } from "@/hooks/useAccommodations";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Hotel, Wifi, Utensils, Coffee, User, DollarSign, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface AccommodationsListProps {
  limit?: number;
  showViewAll?: boolean;
}

export const AccommodationsList = ({ limit, showViewAll = false }: AccommodationsListProps) => {
  const { data: accommodations, isLoading, error } = useAccommodations();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limit || 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="relative">
              <Skeleton className="h-48 w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error loading accommodations",
      description: "Please try again later or contact support.",
      variant: "destructive",
    });
    return <div>Error loading accommodations. Please try again later.</div>;
  }

  if (!accommodations?.length) {
    return <div>No accommodations found. Check back later for new listings!</div>;
  }

  const displayedAccommodations = limit ? accommodations.slice(0, limit) : accommodations;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAccommodations.map((accommodation) => (
          <Card key={accommodation.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative aspect-video overflow-hidden">
              {accommodation.image_url ? (
                <img
                  src={accommodation.image_url}
                  alt={accommodation.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="bg-muted w-full h-full flex items-center justify-center">
                  <Hotel className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                  {accommodation.accommodation_type}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{accommodation.name}</CardTitle>
                {accommodation.rating && (
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{accommodation.rating}</span>
                  </div>
                )}
              </div>
              <CardDescription>{accommodation.location}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {accommodation.amenities && accommodation.amenities.length > 0 && (
                  <>
                    {accommodation.amenities.includes('wifi') && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        <span>WiFi</span>
                      </Badge>
                    )}
                    {accommodation.amenities.includes('breakfast') && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Coffee className="h-3 w-3" />
                        <span>Breakfast</span>
                      </Badge>
                    )}
                    {accommodation.amenities.includes('restaurant') && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" />
                        <span>Restaurant</span>
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Up to {accommodation.max_guests} guests</span>
                </div>
                <div className="flex items-center font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {accommodation.price_per_night}/night
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate(`/accommodation/${accommodation.id}`)} 
                className="w-full"
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {showViewAll && accommodations.length > limit! && (
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/accommodations')}
            className="px-8"
          >
            View All Accommodations
          </Button>
        </div>
      )}
    </div>
  );
};
