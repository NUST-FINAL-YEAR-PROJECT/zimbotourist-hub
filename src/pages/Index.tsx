import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
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
        if (session?.user) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        navigate('/dashboard');
      }
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
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
              {isLoadingAuth ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : user ? (
                <Button
                  variant="outline"
                  className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
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
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary hover:bg-primary/90"
                onClick={() => console.log("Search for:", searchQuery)}
              >
                <Search className="w-5 h-5" />
              </Button>
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
