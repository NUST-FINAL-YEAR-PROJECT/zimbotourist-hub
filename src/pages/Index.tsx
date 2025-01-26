import { motion } from "framer-motion";
import { DestinationCard } from "@/components/DestinationCard";

const destinations = [
  {
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
    title: "Victoria Falls",
    description: "Experience one of the world's largest waterfalls, a UNESCO World Heritage site.",
    price: "$299",
  },
  {
    image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d",
    title: "Hwange National Park",
    description: "Zimbabwe's largest national park, home to over 100 species of mammals.",
    price: "$199",
  },
  {
    image: "https://images.unsplash.com/photo-1438565434616-3ef039228b15",
    title: "Great Zimbabwe",
    description: "Ancient ruins that tell the story of Zimbabwe's rich cultural heritage.",
    price: "$149",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <section className="hero-section">
        <img
          src="https://images.unsplash.com/photo-1501286353178-1ec881214838"
          alt="Zimbabwe Landscape"
          className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="section-title text-white mb-4">
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
          <h2 className="section-title text-center text-primary mb-16">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <DestinationCard key={index} {...destination} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;