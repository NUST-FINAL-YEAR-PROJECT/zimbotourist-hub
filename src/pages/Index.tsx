import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Compass, Globe, ArrowRight, Users, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const filteredDestinations = useMemo(() => {
    if (!destinations) return [];
    return destinations.filter((destination) =>
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [destinations, searchQuery]);

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
      color: "bg-blue-500"
    },
    {
      icon: Compass,
      title: "Adventure Tours",
      description: "Experience thrilling safaris and nature walks",
      color: "bg-green-500"
    },
    {
      icon: Sun,
      title: "Perfect Weather",
      description: "Enjoy year-round sunshine and mild climate",
      color: "bg-yellow-500"
    },
    {
      icon: Users,
      title: "Local Guides",
      description: "Connect with experienced local guides",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="hero-section relative h-[90vh] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </motion.div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-end items-center py-6 gap-4">
            {isLoadingAuth ? (
              <div className="animate-pulse w-20 h-8 bg-white/20 rounded" />
            ) : user ? (
              <>
                <Button
                  variant="outline"
                  className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10"
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
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Discover Zimbabwe's <span className="text-primary">Natural Wonders</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12">
              Experience the magic of Southern Africa's hidden paradise
            </p>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-3xl mx-auto transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-6 text-lg border-2 border-gray-100 focus:border-primary/20"
                  />
                </div>
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Add dates"
                    className="pl-10 py-6 text-lg border-2 border-gray-100 focus:border-primary/20"
                  />
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => console.log("Search for:", searchQuery)}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
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

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 rounded-xl hover:bg-gray-50 transition-colors duration-300"
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

      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
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
                <DestinationCard
                  key={destination.id}
                  image={destination.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                  title={destination.name}
                  description={destination.description || ""}
                  price={`$${destination.price}`}
                  id={destination.id}
                />
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

      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
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
        </div>
      </section>
    </div>
  );
};

export default Index;
