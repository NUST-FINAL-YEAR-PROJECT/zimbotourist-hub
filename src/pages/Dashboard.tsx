import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { DestinationCard } from "@/components/DestinationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Booking } from "@/types/models";
import { CalendarDays, MapPin, Ticket, User } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";

// Separate components for each route
const DashboardHome = ({ profile }: { profile: Profile }) => (
  <Card className="p-6 bg-white shadow-lg rounded-xl border-none">
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
      <div className="relative">
        <Avatar className="h-24 w-24 ring-4 ring-primary/10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/5 text-primary text-xl">
            {profile.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full">
          <User className="h-4 w-4" />
        </div>
      </div>
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-gray-900">{profile.username || 'Welcome!'}</h2>
        <p className="text-muted-foreground">{profile.email}</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {profile.role}
          </span>
        </div>
      </div>
    </div>
  </Card>
);

const BookingsList = ({ bookings }: { bookings: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {bookings.map((booking) => (
      <Card key={booking.id} className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="aspect-[4/3] relative">
          <img
            src={booking.destinations?.image_url || booking.events?.image_url || "/placeholder.svg"}
            alt={booking.destinations?.name || booking.events?.title || "Booking"}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {booking.destinations?.name || booking.events?.title}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date(booking.booking_date).toLocaleDateString()}
            </p>
            <p className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {booking.number_of_people} {booking.number_of_people === 1 ? 'Person' : 'People'}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-lg font-semibold text-primary">
              ${booking.total_price.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const EventsList = ({ events }: { events: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {events?.map((event) => (
      <DestinationCard
        key={event.id}
        id={event.id}
        image={event.image_url || "/placeholder.svg"}
        title={event.title}
        description={event.description || ""}
        price={`$${event.price}`}
      />
    ))}
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          destinations (name, image_url),
          events (title, image_url)
        `)
        .eq('user_id', profile?.id);

      if (error) throw error;
      return data as (Booking & {
        destinations: { name: string; image_url: string | null } | null;
        events: { title: string; image_url: string | null } | null;
      })[];
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please sign in to access the dashboard",
        });
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(profileData);
    };

    checkAuth();
  }, [navigate, toast]);

  if (isLoadingDestinations || isLoadingEvents || isLoadingBookings || !profile) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 p-8">
            <div className="container mx-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <SidebarTrigger />
            </div>
            
            <Routes>
              <Route path="/" element={<DashboardHome profile={profile} />} />
              <Route path="/bookings" element={<BookingsList bookings={bookings || []} />} />
              <Route path="/destinations" element={
                <DestinationExplorer 
                  destinations={destinations || []} 
                  isLoading={isLoadingDestinations}
                />
              } />
              <Route path="/events" element={<EventsList events={events || []} />} />
              <Route path="/profile" element={<DashboardHome profile={profile} />} />
              <Route path="/settings" element={<h2>Settings Page (Coming Soon)</h2>} />
            </Routes>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};