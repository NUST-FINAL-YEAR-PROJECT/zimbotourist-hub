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

      const matchesLocation = searchFilters.location
        ? destination.location.toLowerCase().includes(searchFilters.location.toLowerCase())
        : true;

      const matchesPriceRange = searchFilters.priceRange
        ? (searchFilters.priceRange === "under100" && destination.price < 100) ||
          (searchFilters.priceRange === "100to300" && destination.price >= 100 && destination.price <= 300) ||
          (searchFilters.priceRange === "over300" && destination.price > 300)
        : true;

      const matchesCategory = searchFilters.category
        ? destination.categories?.includes(searchFilters.category)
        : true;

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
    <div className="min-h-screen">
      <section className="hero-section">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
            alt="Victoria Falls"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 backdrop-blur-[2px]" />
        </motion.div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-end items-center py-6 gap-4">
            {isLoadingAuth ? (
              <div className="animate-pulse w-20 h-8 bg-white/20 rounded" />
            ) : user ? (
              <>
                <Button
                  variant="outline"
                  className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm"
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
                  className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => handleAuthClick('signin')}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleAuthClick('signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 h-full container mx-auto flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">
              Discover Zimbabwe's <span className="text-primary">Natural Wonders</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12">
              Experience the magic of Southern Africa's hidden paradise
            </p>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-3xl mx-auto transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search destinations, activities, or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 py-6 text-lg border-2 border-gray-100 focus:border-primary/20"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="md:w-auto w-full"
                  >
                    {showAdvancedSearch ? "Hide Filters" : "Show Filters"}
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => console.log("Search for:", searchQuery, searchFilters)}
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
                        <SelectItem value="">Any location</SelectItem>
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
                        <SelectItem value="">Any price</SelectItem>
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
                        <SelectItem value="">Any category</SelectItem>
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-8 hover:scale-105 transition-transform duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.color} bg-opacity-10 mb-6`}>
                  <feature.icon size={24} className={feature.color.replace('bg-', 'text-')} />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
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

      {!isLoadingEvents && events && events.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Upcoming Events</h2>
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

      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                {searchQuery ? 'Search Results' : 'Popular Destinations'}
              </h2>
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
              {filteredDestinations.slice(0, 6).map((destination) => (
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
              {filteredDestinations.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or explore our popular destinations
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-primary text-white overflow-hidden">
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join us and discover the beauty of Zimbabwe's landscapes and culture
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => handleAuthClick('signup')}
            >
              Start Planning Today
            </Button>
          </motion.div>
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What Our Travelers Say</h2>
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
    </div>
  );
};

export default Index;
