
import { motion } from "framer-motion";
import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <section className="relative min-h-[65vh] w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
          alt="Victoria Falls"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-primary/60 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/20 backdrop-blur-sm p-6 sm:p-8 rounded-xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight"
          >
            Discover Zimbabwe's Natural Wonders
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-white/90 mb-6"
          >
            Experience the magic of Southern Africa's hidden paradise with our curated tours
          </motion.p>

          {/* Quick Info Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-6"
          >
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full py-1 px-4">
              <MapPin className="w-4 h-4 text-white mr-2" />
              <span className="text-white text-sm">10+ National Parks</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full py-1 px-4">
              <Calendar className="w-4 h-4 text-white mr-2" />
              <span className="text-white text-sm">Year-round destinations</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full py-1 px-4">
              <Search className="w-4 h-4 text-white mr-2" />
              <span className="text-white text-sm">300+ Popular attractions</span>
            </div>
          </motion.div>

          {/* Search Section - More professional and clean design */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/95 backdrop-blur-md rounded-lg p-3 shadow-xl max-w-md mx-auto"
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 py-2 h-10 text-sm bg-white border-gray-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white shadow-md"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
