
import { motion } from "framer-motion";
import { Globe, Compass, Sun, Users } from "lucide-react";

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
      description: "Discover hidden gems and popular attractions",
      color: "bg-violet-500"
    },
    {
      icon: Compass,
      title: "Adventure Tours",
      description: "Experience thrilling safaris and nature walks",
      color: "bg-fuchsia-500"
    },
    {
      icon: Sun,
      title: "Perfect Weather",
      description: "Enjoy year-round sunshine and mild climate",
      color: "bg-amber-500"
    },
    {
      icon: Users,
      title: "Local Guides",
      description: "Connect with experienced local guides",
      color: "bg-emerald-500"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Zimbabwe?</h2>
          <p className="text-lg sm:text-xl text-muted-foreground">Experience the beauty of Southern Africa</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="p-6 sm:p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-1000 border border-gray-100 group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${feature.color} bg-opacity-10 mb-6 transition-all duration-700 group-hover:bg-opacity-20`}>
                <feature.icon size={24} className={`text-${feature.color.split('-')[1]}-500`} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
