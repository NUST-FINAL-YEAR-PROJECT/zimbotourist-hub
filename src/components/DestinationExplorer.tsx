import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DestinationCard } from "@/components/DestinationCard";
import type { Destination } from "@/types/models";

interface DestinationExplorerProps {
  destinations: Destination[];
  isLoading: boolean;
}

export const DestinationExplorer = ({ destinations, isLoading }: DestinationExplorerProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDestinations = destinations?.filter((destination) =>
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Input
            placeholder="Search destinations by name, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDestinations?.map((destination) => (
          <DestinationCard
            key={destination.id}
            id={destination.id}
            image={destination.image_url || "/placeholder.svg"}
            title={destination.name}
            description={destination.description || ""}
            price={`$${destination.price}`}
          />
        ))}
      </div>
    </div>
  );
};