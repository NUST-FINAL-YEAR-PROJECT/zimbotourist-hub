
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDestinations } from "@/hooks/useDestinations";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "All",
  "National Parks",
  "Waterfalls",
  "Historical",
  "Cultural"
];

export const DestinationsSection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: destinations, isLoading } = useDestinations();
  
  const filteredDestinations = destinations?.filter(destination => {
    if (activeCategory === "All") return true;
    return destination.categories?.includes(activeCategory);
  }).slice(0, 6);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div>
            <h4 className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Handpicked Destinations</h4>
            <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Unforgettable Places
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
              From breathtaking landscapes to cultural heritage sites, discover Zimbabwe's most iconic destinations
            </p>
          </div>
          
          <Button
            variant="ghost"
            className="group text-base font-medium"
            onClick={() => navigate('/destinations')}
          >
            View all destinations
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-wrap gap-3 mb-10"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 transition-all ${
                activeCategory === category 
                  ? "bg-primary text-white" 
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {category}
            </Button>
          ))}
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations?.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group cursor-pointer"
                onClick={() => navigate(`/destination/${destination.id}`)}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <div className="aspect-[4/3]">
                    <img
                      src={destination.image_url || "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"}
                      alt={destination.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium mb-2">
                      <MapPin className="h-4 w-4" />
                      {destination.location}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{destination.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-white/80 line-clamp-1">
                        {destination.description?.substring(0, 60)}...
                      </p>
                      <p className="text-xl font-bold text-amber-400">${destination.price}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
