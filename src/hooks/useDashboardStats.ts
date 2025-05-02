
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DashboardStats {
  totalUsers: number;
  totalDestinations: number;
  totalEvents: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  recentBookings: any[];
  popularDestinations: any[];
  monthlyRevenue: { month: string; revenue: number }[];
  bookingsByStatus: { name: string; value: number }[];
  bookingsByLocation: { location: string; count: number }[];
}

export const useDashboardStats = (filterConfirmedOnly: boolean = false) => {
  return useQuery({
    queryKey: ["dashboardStats", filterConfirmedOnly],
    queryFn: async (): Promise<DashboardStats> => {
      console.log("Fetching dashboard statistics...", filterConfirmedOnly ? "(Confirmed only)" : "(All bookings)");
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
          .select("*, destinations(name, image_url, location), events(title, image_url)")
          .order("created_at", { ascending: false });
        
        if (bookingsError) throw new Error(`Error fetching bookings: ${bookingsError.message}`);
        
        // Filter bookings if requested
        const filteredBookings = filterConfirmedOnly 
          ? bookingData?.filter(b => b.status === 'confirmed') 
          : bookingData || [];
        
        const totalBookings = filteredBookings.length;
        const pendingBookings = bookingData ? bookingData.filter(b => b.status === 'pending').length : 0;
        const confirmedBookings = bookingData ? bookingData.filter(b => b.status === 'confirmed').length : 0;
        const totalRevenue = filteredBookings.reduce((sum, booking) => sum + Number(booking.total_price), 0);
        const recentBookings = filterConfirmedOnly 
          ? filteredBookings.slice(0, 5) 
          : bookingData ? bookingData.slice(0, 5) : [];
        
        // Get popular destinations based on confirmed bookings only
        let popularDestinations = [];
        const bookingsForDestinations = filterConfirmedOnly 
          ? bookingData?.filter(b => b.status === 'confirmed' && b.destination_id)
          : bookingData?.filter(b => b.destination_id);
        
        if (bookingsForDestinations && bookingsForDestinations.length > 0) {
          const destinationCounts = bookingsForDestinations
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
            }, {} as Record<string, any>);
          
          popularDestinations = Object.values(destinationCounts)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5);
        }
        
        // Calculate monthly revenue (for charts)
        const monthlyRevenueMap = new Map<string, number>();
        
        // Get the last 12 months
        const today = new Date();
        for (let i = 0; i < 12; i++) {
          const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStr = month.toLocaleString('default', { month: 'short', year: 'numeric' });
          monthlyRevenueMap.set(monthStr, 0);
        }
        
        // Add booking revenue by month
        filteredBookings.forEach(booking => {
          const date = new Date(booking.created_at);
          const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          
          if (monthlyRevenueMap.has(monthStr)) {
            monthlyRevenueMap.set(
              monthStr, 
              monthlyRevenueMap.get(monthStr)! + Number(booking.total_price)
            );
          }
        });
        
        // Convert map to sorted array
        const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
          .map(([month, revenue]) => ({ month, revenue }))
          .reverse();
        
        // Bookings by status for pie chart
        const bookingsByStatus = [
          { name: 'Confirmed', value: confirmedBookings },
          { name: 'Pending', value: pendingBookings }
        ];
        
        // Bookings by location
        const locationMap = new Map<string, number>();
        filteredBookings.forEach(booking => {
          if (booking.destinations?.location) {
            const location = booking.destinations.location;
            locationMap.set(
              location,
              (locationMap.get(location) || 0) + 1
            );
          }
        });
        
        const bookingsByLocation = Array.from(locationMap.entries())
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count);
        
        return {
          totalUsers: totalUsers || 0,
          totalDestinations: totalDestinations || 0, 
          totalEvents: totalEvents || 0,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          totalRevenue,
          recentBookings,
          popularDestinations,
          monthlyRevenue,
          bookingsByStatus,
          bookingsByLocation
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
