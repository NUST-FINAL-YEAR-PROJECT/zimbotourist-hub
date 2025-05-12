
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDestinations } from "@/hooks/useDestinations";
import { TopNavbar } from "@/components/TopNavbar";
import { HeroSection } from "@/components/HomePage/HeroSection";
import { DestinationsSection } from "@/components/HomePage/DestinationsSection";
import { StatsSection } from "@/components/HomePage/StatsSection";
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
        
        <DestinationsSection />
        
        <StatsSection />
        
        <CTASection />
      </main>
      
      <footer className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-900">Explore Zimbabwe</h3>
            <p className="text-gray-600 leading-relaxed">
              Your gateway to Zimbabwe's breathtaking landscapes and unforgettable adventures.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-gray-800">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/destinations" className="text-gray-600 hover:text-blue-600 transition-colors">All Destinations</a></li>
              <li><a href="/events" className="text-gray-600 hover:text-blue-600 transition-colors">Upcoming Events</a></li>
              <li><a href="/auth" className="text-gray-600 hover:text-blue-600 transition-colors">Sign Up / Login</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-gray-800">Contact</h4>
            <p className="text-gray-600 leading-relaxed">
              Have questions? Reach out to our travel experts.
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2025 Explore Zimbabwe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
