
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
import { FeaturesSection } from "@/components/HomePage/FeaturesSection";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

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
    <div className="min-h-screen w-full overflow-x-hidden bg-blue-50">
      <TopNavbar />
      
      {/* Sections */}
      <main className="w-full">
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white py-16"
        >
          <DestinationsSection />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-blue-50 py-16"
        >
          <FeaturesSection />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white py-16"
        >
          <ExperienceSection />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-blue-50 py-16"
        >
          <VideoFeature />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white py-16"
        >
          <StatsSection />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-blue-50 py-16"
        >
          <TestimonialsSection />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-primary py-16"
        >
          <CTASection />
        </motion.div>
      </main>
      
      {/* Footer with scroll to top */}
      <motion.footer 
        className="bg-white py-16 border-t border-gray-200 w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold mb-4 text-primary">Explore Zimbabwe</h3>
            <p className="text-muted-foreground">
              Your gateway to Zimbabwe's breathtaking landscapes, rich cultural heritage, and unforgettable adventures.
            </p>
          </div>
          
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/destinations" className="text-muted-foreground hover:text-primary transition-colors">All Destinations</a></li>
              <li><a href="/events" className="text-muted-foreground hover:text-primary transition-colors">Upcoming Events</a></li>
              <li><a href="/auth" className="text-muted-foreground hover:text-primary transition-colors">Sign Up / Login</a></li>
              <li><a href="/documentation" className="text-muted-foreground hover:text-primary transition-colors">Travel Guide</a></li>
            </ul>
          </div>
          
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h4 className="font-medium mb-4">Contact</h4>
            <p className="text-muted-foreground">
              Have questions about your Zimbabwe journey? Reach out to our travel experts.
            </p>
            <button 
              className="mt-4 inline-flex items-center text-sm text-primary hover:underline hover:text-blue-700 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Back to top
            </button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-12 pt-6 border-t border-gray-100 text-center text-sm text-muted-foreground">
          <p>© 2025 Explore Zimbabwe. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
