
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { AccommodationsList } from "@/components/AccommodationsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import custom sections
import { HeroSection } from "@/components/HomePage/HeroSection";
import { FeaturesSection } from "@/components/HomePage/FeaturesSection";
import { StatsSection } from "@/components/HomePage/StatsSection";
import { TestimonialsSection } from "@/components/HomePage/TestimonialsSection";
import { CTASection } from "@/components/HomePage/CTASection";

const tourismPhrases = [
  "Discover Zimbabwe's Natural Wonders",
  "Experience Majestic Victoria Falls",
  "Explore Ancient Ruins of Great Zimbabwe",
  "Safari Adventures Await You"
];

const Index = () => {
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    priceRange: "",
    category: "",
    date: "",
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const backgroundImages = useMemo(() => {
    if (!destinations) return [];
    return destinations
      .filter(dest => dest.image_url)
      .map(dest => dest.image_url)
      .slice(0, 4);
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    if (!destinations) return [];
    
    return destinations.filter((destination) => {
      const matchesSearch = searchQuery
        ? destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          destination.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesLocation = searchFilters.location === "all" || !searchFilters.location
        ? true
        : destination.location.toLowerCase().includes(searchFilters.location.toLowerCase());

      const matchesPriceRange = searchFilters.priceRange === "all" || !searchFilters.priceRange
        ? true
        : (searchFilters.priceRange === "under100" && destination.price < 100) ||
          (searchFilters.priceRange === "100to300" && destination.price >= 100 && destination.price <= 300) ||
          (searchFilters.priceRange === "over300" && destination.price > 300);

      const matchesCategory = searchFilters.category === "all" || !searchFilters.category
        ? true
        : destination.categories?.includes(searchFilters.category);

      return matchesSearch && matchesLocation && matchesPriceRange && matchesCategory;
    });
  }, [destinations, searchQuery, searchFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      location: "",
      priceRange: "",
      category: "",
      date: "",
    });
    setSearchQuery("");
  };

  const allCategories = useMemo(() => {
    if (!destinations) return [];
    const categories = new Set<string>();
    destinations.forEach((destination) => {
      destination.categories?.forEach((category) => {
        categories.add(category);
      });
    });
    return Array.from(categories);
  }, [destinations]);

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Hero Section */}
      <HeroSection 
        backgroundImages={backgroundImages}
        tourismPhrases={tourismPhrases}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchFilters={searchFilters}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        showAdvancedSearch={showAdvancedSearch}
        setShowAdvancedSearch={setShowAdvancedSearch}
        allCategories={allCategories}
      />

      {/* Search Results Section */}
      {(searchQuery || Object.values(searchFilters).some(Boolean)) && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Search Results
            </motion.h2>
            {isLoadingDestinations ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[400px] rounded-xl" />
                ))}
              </div>
            ) : filteredDestinations.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <ArrowRight className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or explore our popular destinations
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDestinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <DestinationCard
                      id={destination.id}
                      image={destination.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                      title={destination.name}
                      description={destination.description || ""}
                      price={`$${destination.price}`}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Popular Destinations */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex justify-between items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Destinations</h2>
              <p className="text-muted-foreground">Explore our hand-picked destinations</p>
            </div>
            <Button variant="ghost" className="text-primary group hidden md:flex">
              View all 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
          
          {isLoadingDestinations ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations?.slice(0, 6).map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <DestinationCard
                    image={destination.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                    title={destination.name}
                    description={destination.description || ""}
                    price={`$${destination.price}`}
                    id={destination.id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Accommodations Section */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex justify-between items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Accommodations</h2>
              <p className="text-muted-foreground">Find the perfect place to stay</p>
            </div>
            <Button 
              variant="ghost" 
              className="text-primary group hidden md:flex" 
              onClick={() => navigate('/accommodations')}
            >
              View all 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
          
          <AccommodationsList limit={3} showViewAll={true} />
        </div>
      </section>

      {/* Events Section (if events exist) */}
      {!isLoadingEvents && events && events.length > 0 && (
        <section className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on these amazing experiences</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-700"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <img
                    src={event.image_url || "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-primary">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">{new Date(event.start_date || '').toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-primary">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">{event.price}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

export default Index;
