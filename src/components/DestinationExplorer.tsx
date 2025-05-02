
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, MapPin, Calendar, Clock, SlidersHorizontal } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/models";

export const DestinationExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist(user?.id);
  const { toast } = useToast();
  const { data: destinations = [], isLoading } = useDestinations();

  // Trigger card animation when filter changes
  useEffect(() => {
    setAnimateCards(true);
    const timeout = setTimeout(() => setAnimateCards(false), 300);
    return () => clearTimeout(timeout);
  }, [selectedCategories, sortBy, searchQuery]);

  // Get unique categories from all destinations
  const allCategories = Array.from(
    new Set(
      (destinations || []).flatMap((dest) => dest.categories || [])
        .filter(Boolean)
    )
  ).sort();

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
      toast({
        title: "Removed from wishlist",
        description: "Destination has been removed from your wishlist",
        variant: "default"
      });
    } else {
      addToWishlist.mutate(destinationId);
      toast({
        title: "Added to wishlist",
        description: "Destination has been added to your wishlist",
        variant: "success"
      });
    }
  };

  const filteredDestinations = (destinations || []).filter((destination) => {
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

  const sortedDestinations = [...filteredDestinations].sort((a, b) => {
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search destinations by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white shadow-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12 shadow-sm">
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
              className={cn(
                "h-12 w-12 shadow-sm transition-all", 
                showFilters ? "bg-primary text-white" : ""
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-white shadow-md rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Filter by Category</h3>
                  {selectedCategories.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategories([])}
                      className="text-xs text-muted-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer text-sm py-1 px-3 hover:bg-primary/10",
                        selectedCategories.includes(category) 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "bg-white"
                      )}
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
                
                {selectedCategories.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-sm text-blue-700"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Showing destinations matching {selectedCategories.length} selected {selectedCategories.length === 1 ? 'category' : 'categories'}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {sortedDestinations.length} {sortedDestinations.length === 1 ? 'destination' : 'destinations'} found
        </p>
      </div>

      <AnimatePresence mode="wait">
        {animateCards ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        ) : sortedDestinations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 space-y-4"
          >
            <div className="bg-gray-100 mx-auto flex items-center justify-center h-20 w-20 rounded-full">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium">No destinations found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any destinations matching your search criteria. Try adjusting your filters or search term.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <DestinationCard
                  id={destination.id}
                  image={destination.image_url || "/placeholder.svg"}
                  title={destination.name}
                  description={destination.description || ""}
                  price={`$${destination.price}`}
                  showSimilar={false} // Removed similar destinations feature
                  isInWishlist={wishlist.includes(destination.id)}
                  onWishlistToggle={handleWishlistToggle}
                  categories={destination.categories || []}
                  duration={destination.duration_recommended || undefined}
                  bestTimeToVisit={destination.best_time_to_visit || undefined}
                  location={destination.location}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
