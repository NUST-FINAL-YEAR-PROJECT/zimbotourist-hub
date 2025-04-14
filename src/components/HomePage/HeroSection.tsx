
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";

interface HeroSectionProps {
  backgroundImages: string[];
  tourismPhrases: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilters: {
    location: string;
    priceRange: string;
    category: string;
    date: string;
  };
  handleFilterChange: (key: string, value: string) => void;
  clearFilters: () => void;
  showAdvancedSearch: boolean;
  setShowAdvancedSearch: (show: boolean) => void;
  allCategories: string[];
}

export const HeroSection = ({
  backgroundImages,
  tourismPhrases,
  searchQuery,
  setSearchQuery,
  searchFilters,
  handleFilterChange,
  clearFilters,
  showAdvancedSearch,
  setShowAdvancedSearch,
  allCategories,
}: HeroSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (backgroundImages.length === 0) return;
    
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 15000); // Increased to 15 seconds for slower transitions
    
    const phraseInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % tourismPhrases.length);
    }, 5000); // Increased to 5 seconds for slower text transitions
    
    return () => {
      clearInterval(imageInterval);
      clearInterval(phraseInterval);
    };
  }, [backgroundImages, tourismPhrases]);

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
  }, []);

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

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {backgroundImages.length > 0 && (
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <img
              src={backgroundImages[currentImageIndex] || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
              alt="Zimbabwe Landscape"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/70" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <div className="flex justify-end items-center py-4 sm:py-6 gap-2 space-x-2">
          <div className="block sm:hidden">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          {isLoadingAuth ? (
            <div className="animate-pulse w-20 h-8 bg-white/20 rounded" />
          ) : user ? (
            <>
              <Button
                variant="secondary"
                className="text-primary-foreground hover:text-primary-foreground/90 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                className="text-white hover:text-white/90 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm text-sm sm:text-base"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                className="bg-white/90 hover:bg-white text-primary hover:text-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                onClick={() => handleAuthClick('signin')}
              >
                Sign In
              </Button>
              <Button
                className="bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                onClick={() => handleAuthClick('signup')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto w-full"
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentPhraseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-4 sm:mb-6 leading-tight"
              >
                {tourismPhrases[currentPhraseIndex]}
              </motion.h1>
            </AnimatePresence>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 lg:mb-12"
            >
              Experience the magic of Southern Africa's hidden paradise
            </motion.p>

            {/* Search Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl max-w-3xl mx-auto"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search destinations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 py-4 sm:py-6 text-sm sm:text-base lg:text-lg bg-white border-gray-200"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="sm:w-auto w-full bg-white text-primary hover:text-primary/90 border-gray-200 text-sm sm:text-base"
                  >
                    {showAdvancedSearch ? "Hide Filters" : "Show Filters"}
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-lg py-4 sm:py-6 px-6 sm:px-8 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Search
                  </Button>
                </div>

                {showAdvancedSearch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
