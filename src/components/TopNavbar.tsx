import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, ChevronDown, Globe, MapPin, CalendarDays, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
          ? "bg-white/95 shadow-md backdrop-blur-sm py-2" 
          : "bg-transparent py-4"
      )}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className={cn(
              "font-bold text-xl transition-colors",
              isScrolled ? "text-primary" : "text-white"
            )}>
              Zimbabwe Tourism
            </span>
          </Link>

          <NavigationMenu className="mr-4">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "bg-transparent",
                  isScrolled ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/20"
                )}>
                  Destinations
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                          href="/destination/1"
                        >
                          <MapPin className="h-6 w-6 text-white" />
                          <div className="mt-4 mb-2 text-lg font-medium text-white">
                            Victoria Falls
                          </div>
                          <p className="text-sm leading-tight text-white/90">
                            Experience the majestic Victoria Falls, one of the largest waterfalls in the world
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a href="/destination/2" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Great Zimbabwe</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Ancient stone structures and historical monuments
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a href="/destination/3" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Hwange National Park</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Home to vast elephant herds and diverse wildlife
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a href="/destination/4" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Mana Pools</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            UNESCO World Heritage site offering incredible safari experiences
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "bg-transparent",
                  isScrolled ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/20"
                )}>
                  Experiences
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] md:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm font-medium">Safari Adventures</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Wildlife safari experiences across Zimbabwe's national parks
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">Cultural Tours</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Immerse yourself in Zimbabwe's rich culture and traditions
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-sm font-medium">Events</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Discover upcoming cultural and tourism events
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/documentation" className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent",
                  isScrolled ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/20"
                )}>
                  About
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-2">
            {isLoadingAuth ? (
              <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className={cn(
                    isScrolled 
                      ? "bg-white text-foreground border-gray-200" 
                      : "bg-white/20 text-white hover:bg-white/30 border-white/30"
                  )}>
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="outline" size="sm" className={cn(
                    isScrolled 
                      ? "bg-white text-foreground border-gray-200" 
                      : "bg-white/20 text-white hover:bg-white/30 border-white/30"
                  )}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
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
              <X className={isScrolled ? "text-foreground" : "text-white"} />
            ) : (
              <Menu className={isScrolled ? "text-foreground" : "text-white"} />
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
                className="flex items-center justify-between p-3 rounded-md hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Home className="w-5 h-5 mr-3 text-primary" />
                  <span className="font-medium">Home</span>
                </div>
              </Link>
              <div className="p-3 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">Destinations</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="p-3 rounded-md hover:bg-accent cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">Experiences</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <Link 
                to="/documentation"
                className="flex items-center justify-between p-3 rounded-md hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-primary" />
                  <span className="font-medium">About</span>
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
                      <Button variant="outline" className="w-full justify-start">
                        <Home className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="default" 
                      className="w-full justify-start"
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
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link 
                      to="/auth?mode=signup"
                      className="block w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="default" className="w-full">Sign Up</Button>
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
