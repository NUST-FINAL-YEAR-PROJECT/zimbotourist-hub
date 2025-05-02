
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DestinationExplorer } from "@/components/DestinationExplorer";

export const DestinationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-primary/5">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200/40 to-transparent" />
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
            </motion.div>
          </div>

          <div className="container relative mx-auto px-4 py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-white p-1.5 rounded-full">
                  <Compass className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-primary">Explore Zimbabwe</span>
              </div>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Discover Zimbabwe's <span className="text-primary">Hidden Gems</span>
              </h1>
              <p className="mb-8 text-lg text-gray-600 md:text-xl max-w-2xl">
                Immerse yourself in breathtaking landscapes, wildlife encounters, and authentic cultural experiences across Zimbabwe's most iconic destinations.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="gap-2 px-6"
                  onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                >
                  <Search className="h-4 w-4" />
                  Find Your Adventure
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2" 
                  onClick={() => navigate('/dashboard/bookings')}
                >
                  <MapPin className="h-4 w-4" />
                  View Your Bookings
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-bold">Explore All Destinations</h2>
            <p className="text-gray-500 max-w-3xl">
              Browse our curated collection of Zimbabwe's most stunning locations. Filter by category, 
              sort by preference, and find your perfect destination.
            </p>
          </div>
          <DestinationExplorer />
        </div>
      </div>
    </div>
  );
};
