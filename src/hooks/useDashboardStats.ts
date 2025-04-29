
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DashboardStats {
  totalUsers: number;
  totalDestinations: number;
  totalEvents: number;
  totalBookings: number;
  recentBookings: any[];
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  popularDestinations: any[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async (): Promise<DashboardStats> => {
      console.log("Fetching dashboard statistics...");
      try {
        // Get total users
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        
        if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);
        
        // Get total destinations
        const { count: totalDestinations, error: destinationsError } = await supabase
          .from("destinations")
          .select("*", { count: "exact", head: true });
        
        if (destinationsError) throw new Error(`Error fetching destinations: ${destinationsError.message}`);
        
        // Get total events
        const { count: totalEvents, error: eventsError } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true });
        
        if (eventsError) throw new Error(`Error fetching events: ${eventsError.message}`);
        
        // Get booking statistics
        const { data: bookingData, error: bookingsError } = await supabase
          .from("bookings")
          .select("*, destinations(name, image_url), events(title, image_url)")
          .order("created_at", { ascending: false });
        
        if (bookingsError) throw new Error(`Error fetching bookings: ${bookingsError.message}`);
        
        const totalBookings = bookingData ? bookingData.length : 0;
        const pendingBookings = bookingData ? bookingData.filter(b => b.status === 'pending').length : 0;
        const confirmedBookings = bookingData ? bookingData.filter(b => b.status === 'confirmed').length : 0;
        const totalRevenue = bookingData ? bookingData.reduce((sum, booking) => sum + Number(booking.total_price), 0) : 0;
        const recentBookings = bookingData ? bookingData.slice(0, 5) : [];
        
        // Get popular destinations
        let popularDestinations = [];
        if (bookingData && bookingData.length > 0) {
          const destinationCounts = bookingData
            .filter(b => b.destination_id)
            .reduce((acc, booking) => {
              const destinationId = booking.destination_id;
              if (!destinationId) return acc;
              
              if (acc[destinationId]) {
                acc[destinationId].count += 1;
                acc[destinationId].revenue += Number(booking.total_price);
              } else {
                acc[destinationId] = {
                  id: destinationId,
                  name: booking.destinations?.name || "Unknown",
                  count: 1,
                  revenue: Number(booking.total_price),
                  image_url: booking.destinations?.image_url
                };
              }
              return acc;
            }, {});
          
          popularDestinations = Object.values(destinationCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
        
        return {
          totalUsers: totalUsers || 0,
          totalDestinations: totalDestinations || 0, 
          totalEvents: totalEvents || 0,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          totalRevenue,
          recentBookings,
          popularDestinations
        };
      } catch (err: any) {
        console.error("Error fetching dashboard statistics:", err);
        toast.error("Failed to fetch dashboard statistics");
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};
