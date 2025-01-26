import { motion } from "framer-motion";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();

  return (
    <div className="min-h-screen">
      <section className="hero-section relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1501286353178-1ec881214838"
          alt="Zimbabwe Landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
              Discover Zimbabwe
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8">
              Experience the beauty, culture, and wildlife of Southern Africa's hidden gem
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-full text-lg font-semibold hover:bg-white/90 transition-colors">
              Start Your Journey
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 bg-accent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-primary mb-16">
            Popular Destinations
          </h2>
          {isLoadingDestinations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations?.slice(0, 3).map((destination) => (
                <DestinationCard
                  key={destination.id}
                  image={destination.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                  title={destination.name}
                  description={destination.description || ""}
                  price={`$${destination.price}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;