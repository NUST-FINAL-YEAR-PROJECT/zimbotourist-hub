
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const TopNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          return;
        }
        
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
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
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/95 shadow-md backdrop-blur-sm py-3" 
          : "bg-transparent py-5"
      )}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <span className={cn(
              "font-bold text-xl transition-colors",
              isScrolled ? "text-blue-600" : "text-white"
            )}>
              Zimbabwe Tourism
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {isLoadingAuth ? (
              <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className={cn(
                    "px-4 py-2 h-10",
                    isScrolled 
                      ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50" 
                      : "bg-white/20 text-white hover:bg-white/30 border-white/30"
                  )}>
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="blue" 
                  size="sm" 
                  className="text-white px-4 py-2 h-10"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "px-5 py-2 h-10 font-medium text-base",
                      isScrolled 
                        ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50" 
                        : "bg-white/20 text-white hover:bg-white/30 border-white/30"
                    )}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button 
                    variant="blue" 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 h-10 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full"
          >
            {isMenuOpen ? (
              <X className={isScrolled ? "text-blue-600" : "text-white"} />
            ) : (
              <Menu className={isScrolled ? "text-blue-600" : "text-white"} />
            )}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          className="fixed inset-0 bg-background z-40 pt-20"
        >
          <div className="container mx-auto px-4 py-6">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="flex items-center justify-between p-3 rounded-md hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="font-medium">Home</span>
                </div>
              </Link>

              <div className="pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link 
                      to="/dashboard"
                      className="block w-full mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="blue" 
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/auth"
                      className="block w-full mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">Sign In</Button>
                    </Link>
                    <Link 
                      to="/auth?mode=signup"
                      className="block w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="blue" className="w-full bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </>
  );
};
