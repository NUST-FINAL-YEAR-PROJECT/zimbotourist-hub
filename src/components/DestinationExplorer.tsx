
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DestinationCard } from "@/components/DestinationCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDestinations } from "@/hooks/useDestinations";
import type { Destination } from "@/types/models";

export const DestinationExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist(user?.id);
  const { toast } = useToast();
  const { data: destinations = [], isLoading } = useDestinations();

  // Get unique categories from all destinations
  const allCategories = Array.from(
    new Set(
      destinations.flatMap((dest) => dest.categories || [])
        .filter(Boolean)
    )
  );

  const handleWishlistToggle = (destinationId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add to wishlist"
      });
      return;
    }
    
    if (wishlist.includes(destinationId)) {
      removeFromWishlist.mutate(destinationId);
    } else {
      addToWishlist.mutate(destinationId);
    }
  };

  const filteredDestinations = destinations?.filter((destination) => {
    const matchesSearch = 
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategories = 
      selectedCategories.length === 0 ||
      selectedCategories.every(cat => 
        destination.categories?.includes(cat)
      );

    return matchesSearch && matchesCategories;
  });

  const sortedDestinations = [...(filteredDestinations || [])].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search destinations by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-white" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    );
                  }}
                >
                  {category}
                  {selectedCategories.includes(category) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {sortedDestinations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No destinations found matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              id={destination.id}
              image={destination.image_url || "/placeholder.svg"}
              title={destination.name}
              description={destination.description || ""}
              price={`$${destination.price}`}
              showSimilar={true}
              isInWishlist={wishlist.includes(destination.id)}
              onWishlistToggle={handleWishlistToggle}
              categories={destination.categories || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};
