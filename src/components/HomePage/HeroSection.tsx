
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion } from "framer-motion";

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
    <section className="relative min-h-[95vh] flex flex-col justify-center items-center">
      {/* Background with animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 w-full"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601581975053-7c899da7d575')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 to-blue-800/80" />
        
        {/* Animated circles */}
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-[10%] h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"
        />
        <motion.div 
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-[10%] h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
        />
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white font-display mb-8"
        >
          <span className={`block ${isMobile ? "text-4xl" : "text-6xl"} font-bold`}>Explore</span>
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className={`block ${isMobile ? "text-5xl" : "text-7xl"} font-extrabold text-white`}
          >
            Zimbabwe
          </motion.span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-white/90 text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Experience the breathtaking beauty, rich culture, and unforgettable adventures 
          across Zimbabwe's most spectacular landscapes.
        </motion.p>
        
        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
          whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="text"
                placeholder="Where in Zimbabwe do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 h-12 bg-white/20 text-white border-white/30 
                  placeholder:text-white/70 focus:border-blue-400 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              variant="blue"
              size="lg"
              className="h-12 bg-blue-500 hover:bg-blue-600 transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              Explore Now
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
