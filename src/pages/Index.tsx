import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Compass, Globe, ArrowRight, Users, Sun, Star, Clock, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    priceRange: "",
    category: "",
    date: "",
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          toast.error("Authentication error. Please try logging in again.");
          return;
        }
        
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error checking user session:", error);
        toast.error("Failed to check authentication status");
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        toast.success("Successfully signed out");
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null);
      } else if (event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        setUser(session?.user || null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuthClick = async (mode: 'signin' | 'signup') => {
    try {
      if (mode === 'signup') {
        navigate('/auth?mode=signup');
      } else {
        navigate('/auth');
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate to authentication page");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const features = [
    {
      icon: Globe,
      title: "Explore Zimbabwe",
      description: "Discover hidden gems and popular attractions",
      color: "bg-violet-500"
    },
    {
      icon: Compass,
      title: "Adventure Tours",
      description: "Experience thrilling safaris and nature walks",
      color: "bg-fuchsia-500"
    },
    {
      icon: Sun,
      title: "Perfect Weather",
      description: "Enjoy year-round sunshine and mild climate",
      color: "bg-amber-500"
    },
    {
      icon: Users,
      title: "Local Guides",
      description: "Connect with experienced local guides",
      color: "bg-emerald-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Adventure Enthusiast",
      content: "Zimbabwe exceeded all my expectations. The natural beauty and warm hospitality made my trip unforgettable.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    {
      name: "Michael Chen",
      role: "Travel Photographer",
      content: "The diversity of wildlife and stunning landscapes provided endless photography opportunities.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    },
    {
      name: "Emily Davis",
      role: "Cultural Explorer",
      content: "The local guides shared incredible insights into Zimbabwe's rich history and traditions.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  ];

  const stats = [
    { label: "Happy Travelers", value: "10,000+", icon: Users },
    { label: "Destinations", value: "50+", icon: MapPin },
    { label: "Local Guides", value: "100+", icon: Compass },
    { label: "Years Experience", value: "15+", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video Background */}
      <section className="relative h-[85vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1500673922987-e212871fec22"
            alt="Zimbabwe Landscape"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/70" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-end items-center py-4 sm:py-6 gap-2 sm:gap-4">
            {isLoadingAuth ? (
              <div className="animate-pulse w-20 h-8 bg-white/20 rounded" />
            ) : user ? (
              <>
                <Button
                  variant="secondary"
                  className="text-primary-foreground hover:text-primary-foreground/90 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="text-white hover:text-white/90 border-white hover:border-white/80 hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => handleAuthClick('signin')}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleAuthClick('signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto w-full"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 sm:mb-6 leading-tight">
                Discover Zimbabwe's <span className="text-accent">Natural Wonders</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12">
                Experience the magic of Southern Africa's hidden paradise
              </p>

              {/* Search Section */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl max-w-3xl mx-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search destinations, activities, or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-6 text-base sm:text-lg bg-white border-gray-200"
                      />
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="sm:w-auto w-full bg-white text-primary hover:text-primary/90 border-gray-200"
                    >
                      {showAdvancedSearch ? "Hide Filters" : "Show Filters"}
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white sm:text-lg py-6 px-8 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </Button>
                  </div>

                  {showAdvancedSearch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <Select
                        value={searchFilters.location}
                        onValueChange={(value) => handleFilterChange("location", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any location</SelectItem>
                          <SelectItem value="harare">Harare</SelectItem>
                          <SelectItem value="victoria falls">Victoria Falls</SelectItem>
                          <SelectItem value="bulawayo">Bulawayo</SelectItem>
                          <SelectItem value="hwange">Hwange</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={searchFilters.priceRange}
                        onValueChange={(value) => handleFilterChange("priceRange", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Price range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any price</SelectItem>
                          <SelectItem value="under100">Under $100</SelectItem>
                          <SelectItem value="100to300">$100 - $300</SelectItem>
                          <SelectItem value="over300">Over $300</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={searchFilters.category}
                        onValueChange={(value) => handleFilterChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any category</SelectItem>
                          {allCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  {(searchQuery || Object.values(searchFilters).some(Boolean)) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="gap-2">
                          Search: {searchQuery}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSearchQuery("")}
                          />
                        </Badge>
                      )}
                      {Object.entries(searchFilters).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <Badge key={key} variant="secondary" className="gap-2">
                            {key}: {value}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleFilterChange(key, "")}
                            />
                          </Badge>
                        );
                      })}
                      {(searchQuery || Object.values(searchFilters).some(Boolean)) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-sm"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {(searchQuery || Object.values(searchFilters).some(Boolean)) && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Search Results</h2>
            {isLoadingDestinations ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[400px] rounded-xl" />
                ))}
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or explore our popular destinations
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDestinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    id={destination.id}
                    image={destination.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                    title={destination.name}
                    description={destination.description || ""}
                    price={`$${destination.price}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Zimbabwe?</h2>
            <p className="text-lg sm:text-xl text-muted-foreground">Experience the beauty of Southern Africa</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 sm:p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${feature.color} bg-opacity-10 mb-6`}>
                  <feature.icon size={24} className={`text-${feature.color.split('-')[1]}-500`} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4">
                  <stat.icon className="w-6 h-6" />
                </div>
                <h4 className="text-3xl font-bold mb-2">{stat.value}</h4>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Destinations</h2>
              <p className="text-muted-foreground">Explore our hand-picked destinations</p>
            </div>
            <Button variant="ghost" className="text-primary group hidden md:flex">
              View all 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
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
              {destinations?.slice(0, 6).map((destination) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
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

      {/* Events Section (if events exist) */}
      {!isLoadingEvents && events && events.length > 0 && (
        <section className="py-20 sm:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on these amazing experiences</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.slice(0, 3).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
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
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Travelers Say</h2>
            <p className="text-muted-foreground">Real experiences from real adventurers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground flex-grow">{testimonial.content}</p>
                  <div className="flex items-center mt-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8">
              Join us and discover the beauty of Zimbabwe's landscapes and culture
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              onClick={() => handleAuthClick('signup')}
            >
              Start Planning Today
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
