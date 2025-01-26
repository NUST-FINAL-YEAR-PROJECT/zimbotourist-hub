import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DestinationCard } from "@/components/DestinationCard";
import type { Destination } from "@/types/models";

interface DestinationExplorerProps {
  destinations: Destination[];
  isLoading: boolean;
}

export const DestinationExplorer = ({ destinations, isLoading }: DestinationExplorerProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const filteredDestinations = destinations?.filter((destination) =>
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          placeholder="Search destinations by name, location, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations?.map((destination) => (
          <DestinationCard
            key={destination.id}
            image={destination.image_url || "/placeholder.svg"}
            title={destination.name}
            description={destination.description || ""}
            price={`$${destination.price}`}
            onViewDetails={() => setSelectedDestination(destination)}
          />
        ))}
      </div>

      <Dialog open={!!selectedDestination} onOpenChange={() => setSelectedDestination(null)}>
        {selectedDestination && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedDestination.name}</DialogTitle>
              <DialogDescription>
                Located in {selectedDestination.location}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={selectedDestination.image_url || "/placeholder.svg"}
                  alt={selectedDestination.name}
                  className="object-cover w-full h-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedDestination.description}</p>
                  </div>
                  
                  {selectedDestination.best_time_to_visit && (
                    <div>
                      <h3 className="font-semibold mb-2">Best Time to Visit</h3>
                      <p className="text-muted-foreground">{selectedDestination.best_time_to_visit}</p>
                    </div>
                  )}
                  
                  {selectedDestination.duration_recommended && (
                    <div>
                      <h3 className="font-semibold mb-2">Recommended Duration</h3>
                      <p className="text-muted-foreground">{selectedDestination.duration_recommended}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {selectedDestination.activities && selectedDestination.activities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Activities</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {selectedDestination.activities.map((activity, index) => (
                          <li key={index}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedDestination.amenities && selectedDestination.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Amenities</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {selectedDestination.amenities.map((amenity, index) => (
                          <li key={index}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-lg font-semibold">${selectedDestination.price}</p>
                  <p className="text-sm text-muted-foreground">per person</p>
                </div>
                <Button onClick={() => navigate(`/booking/${selectedDestination.id}`)}>
                  Book Now
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};