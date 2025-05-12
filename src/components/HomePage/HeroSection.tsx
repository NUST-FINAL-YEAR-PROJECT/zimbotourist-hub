
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
    <section className="relative min-h-screen flex flex-col justify-center items-center">
      {/* Background with clean layout */}
      <div className="absolute inset-0 z-0 w-full">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601581975053-7c899da7d575')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/90 to-amber-800/80" />
      </div>
      
      {/* Content with clean typography */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center max-w-5xl">
        <h1 className="text-white font-display mb-6">
          <span className={`block ${isMobile ? "text-5xl" : "text-7xl"} font-bold`}>Explore</span>
          <span className={`block ${isMobile ? "text-6xl" : "text-8xl"} font-extrabold text-white`}>
            Zimbabwe
          </span>
        </h1>
        
        <p className="text-white/90 text-xl max-w-3xl mx-auto mb-12">
          Experience the breathtaking beauty, rich culture, and unforgettable adventures.
          Your journey begins here.
        </p>
        
        {/* Clean search container */}
        <div className="w-full max-w-3xl bg-white/20 backdrop-blur-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
              <Input
                type="text"
                placeholder="Where in Zimbabwe do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 h-14 text-lg bg-white/20 text-white border-white/20 placeholder:text-white/70
                  focus:border-white/50 focus:ring-1 focus:ring-white/50 rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              size="2xl"
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
            >
              Explore Now
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            <span className="text-sm text-white/80">Popular:</span>
            {["Victoria Falls", "Hwange National Park", "Great Zimbabwe"].map((place) => (
              <Button 
                key={place}
                variant="ghost" 
                size="sm" 
                className="text-sm text-white hover:text-white hover:bg-white/20"
                onClick={() => setSearchQuery(place)}
              >
                {place}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
