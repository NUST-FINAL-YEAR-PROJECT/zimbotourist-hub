import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDestinations = destinations?.filter(destination => 
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <section className="hero-section relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1501286353178-1ec881214838"
          alt="Zimbabwe Landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
          >
            <div className="absolute top-4 right-8 flex gap-4 items-center">
              <Link
                to="/auth"
                className="text-white hover:text-white/90 transition-colors font-semibold px-4 py-2 rounded-md border border-white/30 hover:border-white/50"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-semibold"
              >
                Get Started
              </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
              Discover Zimbabwe
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8">
              Experience the beauty, culture, and wildlife of Southern Africa's hidden gem
            </p>
            <div className="relative max-w-xl mx-auto">
              <Input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 text-lg rounded-full bg-white/95 border-none focus:ring-2 focus:ring-primary"
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                onClick={() => console.log("Search for:", searchQuery)}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 bg-accent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-primary mb-16">
            {searchQuery ? 'Search Results' : 'Popular Destinations'}
          </h2>
          {isLoadingDestinations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(filteredDestinations || []).map((destination) => (
                <DestinationCard
                  key={destination.id}
                  image={destination.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                  title={destination.name}
                  description={destination.description || ""}
                  price={`$${destination.price}`}
                />
              ))}
              {filteredDestinations?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No destinations found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;