
import { motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useEffect } from "react";
import { AnimatedWords } from "./AnimatedWords";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

export const HeroSection = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
}: HeroSectionProps) => {
  const isMobile = useIsMobile();
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
      {/* Background with solid color */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 w-full"
      >
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          style={{ y: scrollY * 0.3 }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601581975053-7c899da7d575')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-primary/70" />
        
        {/* Solid color bottom fade instead of gradient */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-blue-50" />
      </motion.div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/40"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mb-4 w-full"
        >
          <h1 className="text-white font-display tracking-tighter leading-none mb-6">
            <span className={`block ${isMobile ? "text-5xl" : "text-7xl md:text-8xl"} font-bold`}>Explore</span>
            <span className={`block ${isMobile ? "text-6xl" : "text-9xl"} font-extrabold text-white`}>
              Zimbabwe
            </span>
          </h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-2xl md:text-3xl font-display text-white/90 mb-8"
          >
            <span className="block mb-1">Discover</span>
            <AnimatedWords />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Experience the breathtaking beauty, rich culture, and unforgettable adventures.
            Your journey begins here.
          </motion.p>
        </motion.div>
        
        {/* Search container with solid color instead of glass effect */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="w-full max-w-4xl bg-white/20 border border-white/20 
            rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="text"
                placeholder="Where in Zimbabwe do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 h-14 text-lg bg-white/10 text-white border-white/10 placeholder:text-white/50 
                  focus:border-white/30 focus:ring-0 rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              variant="blue"
              className="h-14 px-8 font-medium text-lg rounded-xl transition-all duration-300"
            >
              Explore Now
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            <span className="text-sm text-white/60">Popular:</span>
            {["Victoria Falls", "Hwange National Park", "Great Zimbabwe", "Matobo Hills"].map((place) => (
              <Button 
                key={place}
                variant="ghost" 
                size="sm" 
                className="text-sm h-7 p-0 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setSearchQuery(place)}
              >
                {place}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollY > 20 ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm text-white/80 mb-2">Scroll to discover Zimbabwe</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
