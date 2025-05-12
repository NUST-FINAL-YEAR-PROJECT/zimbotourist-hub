
import { Users, MapPin, Camera, Award, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { motion } from "framer-motion";

export const StatsSection = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  
  const statsItems = [
    { 
      label: "Happy Travelers", 
      value: stats ? stats.totalUsers.toLocaleString() : "0", 
      icon: Users, 
      color: "bg-blue-600"
    },
    { 
      label: "Destinations", 
      value: stats ? stats.totalDestinations.toLocaleString() : "0", 
      icon: MapPin,
      color: "bg-blue-700"
    },
    { 
      label: "Total Bookings", 
      value: stats ? stats.totalBookings.toLocaleString() : "0", 
      icon: Camera,
      color: "bg-blue-800"
    },
    { 
      label: "Total Revenue", 
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0", 
      icon: Award,
      color: "bg-blue-600"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-white relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent" />
      
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="mb-4 bg-blue-600 px-4 py-1 text-sm font-medium">
            Our Statistics
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-blue-900">
            Journey Through Our Numbers
          </h2>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600">Failed to load statistics.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          >
            {statsItems.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 border border-blue-50"
              >
                <div className={`mb-6 w-16 h-16 rounded-full ${stat.color} flex items-center justify-center mx-auto`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="text-3xl font-display font-bold mb-2 text-blue-900"
                >
                  {stat.value}
                </motion.h3>
                <p className="text-blue-700">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
