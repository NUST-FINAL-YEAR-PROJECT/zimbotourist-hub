import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Star, ArrowRight } from "lucide-react";
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

  const blogPosts = [
    {
      title: "Top 10 Hidden Gems in Zimbabwe",
      excerpt: "Discover the unexplored wonders of Zimbabwe's landscape...",
      image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5",
    },
    {
      title: "Best Time to Visit Victoria Falls",
      excerpt: "Plan your perfect trip to the majestic Victoria Falls...",
      image: "https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b",
    },
    {
      title: "Safari Guide: What to Pack",
      excerpt: "Essential tips for your Zimbabwe safari adventure...",
      image: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1501286353178-1ec881214838"
          alt="Zimbabwe Landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 h-full container mx-auto flex flex-col items-center justify-center text-center px-4">
          <div className="absolute top-4 right-8 flex gap-4 items-center">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
              Discover Zimbabwe's Wonders
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12">
              Experience the magic of Southern Africa's hidden paradise
            </p>
            <div className="bg-white rounded-lg p-4 shadow-lg max-w-2xl mx-auto">
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

      {/* Featured Destinations */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {searchQuery ? 'Search Results' : 'Popular Destinations'}
            </h2>
            <Button variant="ghost" className="text-primary">
              View all <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* Blog Section */}
      <section className="py-20 px-4 md:px-8 bg-accent/5">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Travel Inspiration
            </h2>
            <Button variant="ghost" className="text-primary">
              Read more <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold mb-3">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <Button variant="ghost" className="text-primary p-0">
                    Read more <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;