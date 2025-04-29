
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDestinations } from "@/hooks/useDestinations";
import { TopNavbar } from "@/components/TopNavbar";

// Import custom sections
import { HeroSection } from "@/components/HomePage/HeroSection";
import { DestinationsSection } from "@/components/HomePage/DestinationsSection";
import { ExperienceSection } from "@/components/HomePage/ExperienceSection";
import { StatsSection } from "@/components/HomePage/StatsSection";
import { VideoFeature } from "@/components/HomePage/VideoFeature";
import { TestimonialsSection } from "@/components/HomePage/TestimonialsSection";
import { CTASection } from "@/components/HomePage/CTASection";

const Index = () => {
  const { data: destinations } = useDestinations();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const filteredDestinations = useMemo(() => {
    if (!destinations || !searchQuery) return [];
    
    return destinations.filter((destination) => {
      return destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.description?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [destinations, searchQuery]);

  const handleSearch = () => {
    if (filteredDestinations.length > 0 && searchQuery) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <TopNavbar />
      
      {/* Sections */}
      <main>
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        
        <DestinationsSection />
        
        <ExperienceSection />
        
        <VideoFeature />
        
        <StatsSection />
        
        <TestimonialsSection />
        
        <CTASection />
      </main>
      
      {/* Footer with scroll to top */}
      <motion.footer 
        className="bg-white py-8 border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Discover Zimbabwe. All rights reserved.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Back to top
          </button>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
