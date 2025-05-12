
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

  return (
    <section className="py-24 bg-white relative">
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
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-800">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {statsItems.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all"
              >
                <div className={`mb-6 w-16 h-16 rounded-full ${stat.color} flex items-center justify-center mx-auto`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-3xl font-display font-bold mb-2 text-gray-800">
                  {stat.value}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
