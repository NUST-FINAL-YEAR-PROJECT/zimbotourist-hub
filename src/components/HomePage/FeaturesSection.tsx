
import { motion } from "framer-motion";
import { Globe, Compass, Sun, Users, MapPin, Camera, Coffee, Banknote } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

export const FeaturesSection = () => {
  const features: Feature[] = [
    {
      icon: Globe,
      title: "Explore Zimbabwe",
      description: "Discover hidden gems and popular attractions across the country",
      color: "bg-violet-500"
    },
    {
      icon: Compass,
      title: "Adventure Tours",
      description: "Experience thrilling safaris, hiking trails and nature walks",
      color: "bg-fuchsia-500"
    },
    {
      icon: Sun,
      title: "Perfect Weather",
      description: "Enjoy year-round sunshine and mild climate for outdoor activities",
      color: "bg-amber-500"
    },
    {
      icon: Users,
      title: "Local Guides",
      description: "Connect with experienced local guides who know every hidden spot",
      color: "bg-emerald-500"
    },
    {
      icon: MapPin,
      title: "Unique Locations",
      description: "Visit UNESCO World Heritage sites and natural wonders",
      color: "bg-blue-500"
    },
    {
      icon: Camera,
      title: "Photo Opportunities",
      description: "Capture stunning landscapes and wildlife in their natural habitat",
      color: "bg-pink-500"
    },
    {
      icon: Coffee,
      title: "Cultural Experiences",
      description: "Immerse yourself in rich local traditions and authentic cuisine",
      color: "bg-orange-500"
    },
    {
      icon: Banknote,
      title: "Value Packages",
      description: "Enjoy the best experiences with our affordable travel packages",
      color: "bg-teal-500"
    }
  ];

  return (
    <section className="py-10 sm:py-16 bg-white">
      <div className="content-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Why Choose Zimbabwe?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Experience the beauty of Southern Africa with these amazing features</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-700 border border-gray-100 group"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.color} bg-opacity-10 mb-4 transition-all duration-700 group-hover:bg-opacity-20`}>
                <feature.icon size={20} className={`text-${feature.color.split('-')[1]}-500`} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
