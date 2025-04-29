
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
      color: "bg-blue-500",
      gradient: "from-blue-400 to-blue-600"
    },
    { 
      label: "Destinations", 
      value: stats ? stats.totalDestinations.toLocaleString() : "0", 
      icon: MapPin,
      color: "bg-purple-500",
      gradient: "from-purple-400 to-purple-600"
    },
    { 
      label: "Total Bookings", 
      value: stats ? stats.totalBookings.toLocaleString() : "0", 
      icon: Camera,
      color: "bg-pink-500",
      gradient: "from-pink-400 to-pink-600"
    },
    { 
      label: "Total Revenue", 
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0", 
      icon: Award,
      color: "bg-amber-500",
      gradient: "from-amber-400 to-amber-600"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Colorful background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606108627827-ec3f836df1a1')] bg-cover bg-center opacity-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-yellow-300/40 to-amber-500/40 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-gradient-to-r from-blue-400/40 to-cyan-300/40 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 px-4 py-1 text-sm font-medium">
            Real-Time Data
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gray-800">
            Journey Through Our <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Numbers</span>
          </h2>
          <p className="text-lg text-gray-600">
            Discover how we've helped travelers create unforgettable memories across Zimbabwe
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg transform transition-all duration-500 group-hover:scale-[1.03]" />
                
                <div className="relative p-8 text-center">
                  <div className={`mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto
                    shadow-lg transform transition-all duration-500 group-hover:rotate-6`}>
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
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
