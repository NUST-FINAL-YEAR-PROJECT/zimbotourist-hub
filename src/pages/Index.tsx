
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDestinations } from "@/hooks/useDestinations";
import { TopNavbar } from "@/components/TopNavbar";
import { HeroSection } from "@/components/HomePage/HeroSection";
import { StatsSection } from "@/components/HomePage/StatsSection";
import { CTASection } from "@/components/HomePage/CTASection";
import { ExperienceSection } from "@/components/HomePage/ExperienceSection";
import { FeaturesSection } from "@/components/HomePage/FeaturesSection";
import { VideoFeature } from "@/components/HomePage/VideoFeature";
import { TestimonialsSection } from "@/components/HomePage/TestimonialsSection";
import { motion } from "framer-motion";

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
    if (searchQuery) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <TopNavbar />
      
      <main>
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        
        <ExperienceSection />
        
        <StatsSection />
        
        <FeaturesSection />
        
        <VideoFeature />
        
        <TestimonialsSection />
        
        <CTASection />
      </main>
      
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="bg-blue-900 text-white py-16"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="md:w-1/3">
              <h3 className="text-xl font-bold mb-4">Explore Zimbabwe</h3>
              <p className="text-blue-100 leading-relaxed">
                Your gateway to Zimbabwe's breathtaking landscapes and unforgettable adventures.
              </p>
            </div>
            
            <div className="md:w-1/3 flex flex-col md:items-center">
              <h4 className="font-medium mb-4">Quick Links</h4>
              <nav className="flex flex-col space-y-2">
                <a href="/destinations" className="text-blue-100 hover:text-white transition-colors">All Destinations</a>
                <a href="/events" className="text-blue-100 hover:text-white transition-colors">Upcoming Events</a>
                <a href="/auth" className="text-blue-100 hover:text-white transition-colors">Sign Up / Login</a>
              </nav>
            </div>
            
            <div className="md:w-1/3 flex flex-col md:items-end">
              <h4 className="font-medium mb-4">Contact</h4>
              <p className="text-blue-100">
                Have questions? Reach out to our travel experts.
              </p>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-blue-800/50 text-center">
            <p className="text-blue-200 text-sm">© 2025 Explore Zimbabwe. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
