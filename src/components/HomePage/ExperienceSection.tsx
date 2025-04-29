
import { motion } from "framer-motion";
import { Camera, Compass, Globe, MapPin, Sunrise, Users } from "lucide-react";

type Experience = {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
};

export const ExperienceSection = () => {
  const experiences: Experience[] = [
    {
      icon: Globe,
      title: "World Heritage Sites",
      description: "Visit UNESCO World Heritage sites like Victoria Falls and Great Zimbabwe",
      color: "bg-blue-500"
    },
    {
      icon: Compass,
      title: "Safari Adventures",
      description: "Experience thrilling wildlife encounters in world-famous national parks",
      color: "bg-amber-500"
    },
    {
      icon: Users,
      title: "Cultural Immersion",
      description: "Connect with local communities and learn about their traditions and history",
      color: "bg-emerald-500"
    },
    {
      icon: Camera,
      title: "Photography Paradise",
      description: "Capture stunning landscapes and wildlife in their natural habitat",
      color: "bg-purple-500"
    },
    {
      icon: MapPin,
      title: "Off-the-beaten Path",
      description: "Discover hidden gems and less-traveled destinations with local guides",
      color: "bg-rose-500"
    },
    {
      icon: Sunrise,
      title: "Scenic Beauty",
      description: "Witness breathtaking sunrises and sunsets over diverse landscapes",
      color: "bg-orange-500"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-black/[0.02]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1689655322586-e47572b9b333?q=80')] opacity-[0.03] bg-fixed" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h4 className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Why Visit Zimbabwe</h4>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Experiences That Will 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Transform You</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Zimbabwe offers a diverse range of unique experiences that combine natural beauty, 
            rich culture, and adventure that you won't find anywhere else
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white rounded-3xl shadow-sm p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className={`${experience.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                <experience.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{experience.title}</h3>
              <p className="text-muted-foreground">{experience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
