
import { motion } from "framer-motion";
import { Users, MapPin, Camera, Award, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export const StatsSection = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  
  const statsItems = [
    { 
      label: "Happy Travelers", 
      value: stats ? stats.totalUsers.toLocaleString() : "0", 
      icon: Users, 
      color: "bg-blue-500"
    },
    { 
      label: "Destinations", 
      value: stats ? stats.totalDestinations.toLocaleString() : "0", 
      icon: MapPin,
      color: "bg-amber-500"
    },
    { 
      label: "Total Bookings", 
      value: stats ? stats.totalBookings.toLocaleString() : "0", 
      icon: Camera,
      color: "bg-violet-500"
    },
    { 
      label: "Total Revenue", 
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0", 
      icon: Award,
      color: "bg-emerald-500"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Modern background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606108627827-ec3f836df1a1')] bg-cover bg-center opacity-5" />
      
      {/* Modern decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-amber-200/20 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="mb-4 bg-amber-500 hover:bg-amber-600 px-4 py-1 text-sm font-medium">
            Real-Time Data
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-5 text-gray-800">
            Journey Through Our Numbers
          </h2>
          <p className="text-lg text-gray-600">
            Discover how we've helped travelers create unforgettable memories across Zimbabwe
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600">Failed to load statistics. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-7xl mx-auto">
            {statsItems.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-white rounded-2xl shadow-md transform transition-all duration-500 group-hover:scale-[1.03]" />
                
                <div className="relative p-8 text-center">
                  <div className={`mb-6 w-16 h-16 rounded-2xl ${stat.color} flex items-center justify-center mx-auto
                    shadow-md transform transition-all duration-500 group-hover:rotate-6`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-4xl lg:text-5xl font-display font-bold mb-2 text-gray-800">
                      {stat.value}
                    </h3>
                    <p className="text-lg font-medium text-gray-700">{stat.label}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
