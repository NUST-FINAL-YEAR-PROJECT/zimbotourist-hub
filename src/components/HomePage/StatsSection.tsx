
import { motion } from "framer-motion";
import { Users, MapPin, Compass, Clock } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
}

export const StatsSection = () => {
  const stats: Stat[] = [
    { label: "Happy Travelers", value: "10,000+", icon: Users },
    { label: "Destinations", value: "50+", icon: MapPin },
    { label: "Local Guides", value: "100+", icon: Compass },
    { label: "Years Experience", value: "15+", icon: Clock }
  ];

  return (
    <section className="py-16 sm:py-20 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4 transition-transform duration-500 hover:scale-110">
                <stat.icon className="w-6 h-6" />
              </div>
              <motion.h4 
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {stat.value}
              </motion.h4>
              <p className="text-white/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
