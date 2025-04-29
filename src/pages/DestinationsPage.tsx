
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, MapPin, Calendar, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDestinations } from "@/hooks/useDestinations";
import { DestinationExplorer } from "@/components/DestinationExplorer";

export const DestinationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-primary-foreground">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200/80 to-primary/10" />
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
            </motion.div>
          </div>

          <div className="container relative mx-auto px-4 py-20 sm:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                Explore Zimbabwe's <span className="text-primary">Hidden Gems</span>
              </h1>
              <p className="mb-10 text-lg text-gray-600 md:text-xl">
                Discover breathtaking landscapes, wildlife encounters, and cultural experiences across Zimbabwe's most iconic destinations.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate('/destinations')} variant="default">
                  Browse All Destinations
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                  Find Your Next Adventure
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="mb-8 text-3xl font-bold">Explore All Destinations</h2>
          <DestinationExplorer />
        </div>
      </div>
    </div>
  );
};
