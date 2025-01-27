import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Compass, Globe, ArrowRight, Plane, Sun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const filteredDestinations = destinations?.filter(destination => 
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    navigate(mode === 'signup' ? '/auth?mode=signup' : '/auth');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const features = [
    {
      icon: Globe,
      title: "Explore Zimbabwe",
      description: "Discover hidden gems and popular attractions"
    },
    {
      icon: Compass,
      title: "Adventure Tours",
      description: "Experience thrilling safaris and nature walks"
    },
    {
      icon: Users,
      title: "Local Guides",
      description: "Connect with experienced local guides"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative h-[80vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
            alt="Victoria Falls"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        
        {/* Navigation */}
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
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleAuthClick('signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full container mx-auto flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-3xl space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Discover Zimbabwe's <span className="text-primary">Natural Wonders</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12">
              Experience the magic of Southern Africa's hidden paradise
            </p>
            
            {/* Search Section */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-6 text-lg"
                  />
                </div>
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Add dates"
                    className="pl-10 py-6 text-lg"
                  />
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-lg py-6 px-8"
                  onClick={() => console.log("Search for:", searchQuery)}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                {searchQuery ? 'Search Results' : 'Popular Destinations'}
              </h2>
              <p className="text-muted-foreground">Explore our hand-picked destinations</p>
            </div>
            <Button variant="ghost" className="text-primary group">
              View all 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          {isLoadingDestinations ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(filteredDestinations || []).slice(0, 6).map((destination) => (
                <DestinationCard
                  key={destination.id}
                  image={destination.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                  title={destination.name}
                  description={destination.description || ""}
                  price={`$${destination.price}`}
                  id={destination.id}
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

      {/* Call to Action */}
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
              className="bg-white text-primary hover:bg-white/90"
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