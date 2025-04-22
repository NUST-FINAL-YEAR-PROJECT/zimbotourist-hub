
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  return (
    <section className="relative min-h-[70vh] w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
          alt="Victoria Falls"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-black/60 to-black/80" />
      </div>

      {/* Floating Youtube Video */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, type: "spring" }}
        className="absolute right-4 md:right-16 top-[18%] md:top-[10%] bg-black/70 p-2 rounded-2xl shadow-2xl hover:scale-105 transition-all z-30"
        style={{
          width: "340px",
          maxWidth: "92vw",
          border: "4px solid #ffb300",
        }}
      >
        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/SS1Gg_XXnO8?si=QpVFv8E_yca3qNbF"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-xl"
            style={{ border: 0 }}
          ></iframe>
          <span className="absolute bottom-2 right-2 bg-yellow-400/90 text-black text-xs px-2 py-1 rounded font-bold shadow">Watch Zimbabwe</span>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-6 px-4 py-1.5 animate-fade-in">
          Discover the heart of Africa
        </Badge>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight"
        >
          Explore Zimbabwe's <span className="text-amber-300">Natural Wonders</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl text-white/90 mb-8"
        >
          Your gateway to Southern Africa's hidden paradise
        </motion.p>

        {/* Quick Info Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full py-1.5 px-4">
            <MapPin className="w-4 h-4 text-amber-300 mr-2" />
            <span className="text-white text-sm">10+ National Parks</span>
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full py-1.5 px-4">
            <Calendar className="w-4 h-4 text-amber-300 mr-2" />
            <span className="text-white text-sm">Year-round destinations</span>
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full py-1.5 px-4">
            <Search className="w-4 h-4 text-amber-300 mr-2" />
            <span className="text-white text-sm">300+ Popular attractions</span>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl max-w-xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Where do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 py-6 h-12 text-base bg-white border-gray-200 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white shadow-md py-6 px-6 text-base rounded-lg"
              onClick={handleSearch}
            >
              Search
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <p className="text-xs text-gray-500 mr-2">Popular:</p>
            <Button variant="link" size="sm" className="text-xs h-5 p-0">Victoria Falls</Button>
            <Button variant="link" size="sm" className="text-xs h-5 p-0">Hwange National Park</Button>
            <Button variant="link" size="sm" className="text-xs h-5 p-0">Great Zimbabwe</Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,117.3C672,107,768,117,864,128C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};
