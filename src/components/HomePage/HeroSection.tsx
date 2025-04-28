
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/useIsMobile";
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
  
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      {/* Background Image with modern gradient overlay */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
          alt="Victoria Falls"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-black/50 to-accent/80 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Badge 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-5 py-2 text-base"
          >
            Discover Zimbabwe 🇿🇼
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`${isMobile ? "text-5xl" : "text-7xl md:text-8xl lg:text-9xl"} font-bold text-white mb-8 leading-tight tracking-tight mt-6`}
        >
          Experience <br className="hidden md:block" />
          <AnimatedWords />
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto mb-12"
        >
          Discover breathtaking landscapes, rich culture, and unforgettable adventures
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 my-12"
        >
          {[
            { icon: MapPin, text: "10+ National Parks", delay: 0.6 },
            { icon: Calendar, text: "Year-round destinations", delay: 0.7 },
            { icon: Search, text: "300+ Popular attractions", delay: 0.8 }
          ].map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: item.delay }}
              className="flex items-center bg-white/10 backdrop-blur-md rounded-full py-3 px-6 text-white/90 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <item.icon className="w-5 h-5 text-amber-300 mr-3" />
              <span className="text-base md:text-lg font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl max-w-5xl mx-auto border border-white/20"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
              <Input
                type="text"
                placeholder="Where do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 py-8 h-16 text-lg bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg py-8 px-12 text-lg rounded-xl transition-all duration-300 hover:scale-105"
              onClick={handleSearch}
            >
              Search
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap gap-3 mt-4"
          >
            <span className="text-sm text-gray-500">Popular:</span>
            {["Victoria Falls", "Hwange National Park", "Great Zimbabwe", "Matobo National Park"].map((place, index) => (
              <motion.div
                key={place}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
              >
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-sm h-5 p-0 text-primary/90 hover:text-primary hover:scale-105 transition-transform"
                >
                  {place}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-0 left-0 right-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,149.3C672,160,768,224,864,229.3C960,235,1056,181,1152,149.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </motion.div>
    </section>
  );
};
