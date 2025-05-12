
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
      color: "bg-amber-500"
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
      color: "bg-amber-600"
    },
    { 
      label: "Total Revenue", 
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0", 
      icon: Award,
      color: "bg-amber-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-amber-500 px-4 py-1 text-sm font-medium">
            Real-Time Data
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-5 text-gray-800">
            Journey Through Our Numbers
          </h2>
          <p className="text-lg text-gray-600">
            Discover how we've helped travelers create unforgettable memories across Zimbabwe
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-2 text-gray-600">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600">Failed to load statistics. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {statsItems.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className={`mb-6 w-16 h-16 rounded-2xl ${stat.color} flex items-center justify-center mx-auto shadow-md`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-4xl lg:text-5xl font-display font-bold mb-2 text-gray-800">
                  {stat.value}
                </h3>
                <p className="text-lg font-medium text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
