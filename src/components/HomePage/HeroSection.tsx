
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/useIsMobile";

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
    <section className="relative min-h-[80vh] flex flex-col justify-center items-center">
      {/* Background */}
      <div className="absolute inset-0 z-0 w-full">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601581975053-7c899da7d575')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-800/70" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center max-w-5xl">
        <h1 className="text-white font-display mb-6">
          <span className={`block ${isMobile ? "text-4xl" : "text-6xl"} font-bold`}>Explore</span>
          <span className={`block ${isMobile ? "text-5xl" : "text-7xl"} font-extrabold text-white`}>
            Zimbabwe
          </span>
        </h1>
        
        <p className="text-white/90 text-lg max-w-3xl mx-auto mb-10">
          Experience the breathtaking beauty, rich culture, and unforgettable adventures.
        </p>
        
        {/* Search */}
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="text"
                placeholder="Where in Zimbabwe do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 h-12 bg-white/20 text-white border-white/20 
                  placeholder:text-white/70 focus:border-white/50 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              variant="blue"
              className="h-12"
            >
              Explore Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
