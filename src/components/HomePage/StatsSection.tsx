
import { motion } from "framer-motion";
import { Users, MapPin, Camera, Award } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
}

export const StatsSection = () => {
  const stats: Stat[] = [
    { label: "Happy Travelers", value: "10,000+", icon: Users },
    { label: "Destinations", value: "50+", icon: MapPin },
    { label: "Photo Opportunities", value: "Unlimited", icon: Camera },
    { label: "Travel Awards", value: "25+", icon: Award }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-black text-white">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606108627827-ec3f836df1a1')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-primary/40" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center group"
            >
              <div className="mb-6 w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto
                group-hover:bg-primary transition-all duration-500 transform group-hover:rotate-6">
                <stat.icon className="w-10 h-10" />
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h3 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-lg text-white/80">{stat.label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
