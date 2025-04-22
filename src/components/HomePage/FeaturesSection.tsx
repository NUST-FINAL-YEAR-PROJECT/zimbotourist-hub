
import { motion } from "framer-motion";
import { Globe, Compass, Sun, Users, MapPin, Camera, Coffee, Banknote } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  gradient: string;
}

export const FeaturesSection = () => {
  const features: Feature[] = [
    {
      icon: Globe,
      title: "Explore Zimbabwe",
      description: "Discover hidden gems and popular attractions across the country",
      color: "text-blue-500",
      gradient: "from-blue-500/10 to-blue-600/5"
    },
    {
      icon: Compass,
      title: "Adventure Tours",
      description: "Experience thrilling safaris, hiking trails and nature walks",
      color: "text-purple-500",
      gradient: "from-purple-500/10 to-purple-600/5"
    },
    {
      icon: Sun,
      title: "Perfect Weather",
      description: "Enjoy year-round sunshine and mild climate for outdoor activities",
      color: "text-amber-500",
      gradient: "from-amber-500/10 to-amber-600/5"
    },
    {
      icon: Users,
      title: "Local Guides",
      description: "Connect with experienced local guides who know every hidden spot",
      color: "text-emerald-500",
      gradient: "from-emerald-500/10 to-emerald-600/5"
    },
    {
      icon: MapPin,
      title: "Unique Locations",
      description: "Visit UNESCO World Heritage sites and natural wonders",
      color: "text-rose-500",
      gradient: "from-rose-500/10 to-rose-600/5"
    },
    {
      icon: Camera,
      title: "Photo Opportunities",
      description: "Capture stunning landscapes and wildlife in their natural habitat",
      color: "text-cyan-500",
      gradient: "from-cyan-500/10 to-cyan-600/5"
    },
    {
      icon: Coffee,
      title: "Cultural Experiences",
      description: "Immerse yourself in rich local traditions and authentic cuisine",
      color: "text-orange-500",
      gradient: "from-orange-500/10 to-orange-600/5"
    },
    {
      icon: Banknote,
      title: "Value Packages",
      description: "Enjoy the best experiences with our affordable travel packages",
      color: "text-teal-500",
      gradient: "from-teal-500/10 to-teal-600/5"
    }
  ];

  return (
    <section className="section-spacing bg-gradient-to-b from-white to-gray-50">
      <div className="content-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Why Choose Zimbabwe?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the beauty of Southern Africa with these amazing features
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="feature-card group"
            >
              <div className={`relative z-10 flex flex-col items-center text-center`}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} bg-gradient-to-br ${feature.gradient} shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={24} className={feature.color} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
