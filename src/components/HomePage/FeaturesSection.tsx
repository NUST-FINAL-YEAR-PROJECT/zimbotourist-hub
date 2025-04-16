
import { motion } from "framer-motion";
import { Globe, Compass, Sun, Users, MapPin, Camera, Coffee, Banknote } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export const FeaturesSection = () => {
  const features: Feature[] = [
    {
      icon: Globe,
      title: "Explore Zimbabwe",
      description: "Discover hidden gems and popular attractions across the country",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Compass,
      title: "Adventure Tours",
      description: "Experience thrilling safaris, hiking trails and nature walks",
      color: "text-fuchsia-500",
      bgColor: "bg-fuchsia-50"
    },
    {
      icon: Sun,
      title: "Perfect Weather",
      description: "Enjoy year-round sunshine and mild climate for outdoor activities",
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      icon: Users,
      title: "Local Guides",
      description: "Connect with experienced local guides who know every hidden spot",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
    {
      icon: MapPin,
      title: "Unique Locations",
      description: "Visit UNESCO World Heritage sites and natural wonders",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Camera,
      title: "Photo Opportunities",
      description: "Capture stunning landscapes and wildlife in their natural habitat",
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      icon: Coffee,
      title: "Cultural Experiences",
      description: "Immerse yourself in rich local traditions and authentic cuisine",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      icon: Banknote,
      title: "Value Packages",
      description: "Enjoy the best experiences with our affordable travel packages",
      color: "text-teal-500",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-white to-blue-50">
      <div className="content-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gradient-primary">Why Choose Zimbabwe?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Experience the beauty of Southern Africa with these amazing features</p>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`p-5 rounded-xl ${feature.bgColor} border border-gray-100 hover:shadow-lg transition-all duration-500 group hover:translate-y-[-5px]`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} bg-white shadow-sm mb-4`}>
                <feature.icon size={22} className={feature.color} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
