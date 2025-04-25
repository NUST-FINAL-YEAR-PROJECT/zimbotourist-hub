
import { motion } from "framer-motion";
import { Users, MapPin, Compass, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
}

export const StatsSection = () => {
  const isMobile = useIsMobile();
  
  const stats: Stat[] = [
    { label: "Happy Travelers", value: "10,000+", icon: Users },
    { label: "Destinations", value: "50+", icon: MapPin },
    { label: "Local Guides", value: "100+", icon: Compass },
    { label: "Years Experience", value: "15+", icon: Clock }
  ];

  return (
    <section className="py-28 sm:py-36 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/20">
                <stat.icon className="w-10 h-10" />
              </div>
              <motion.h4 
                className={`${isMobile ? "text-4xl" : "text-5xl lg:text-6xl"} font-bold mb-4`}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {stat.value}
              </motion.h4>
              <p className="text-xl text-white/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
