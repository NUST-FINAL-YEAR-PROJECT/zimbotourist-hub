import { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { DestinationCard } from "@/components/DestinationCard";
import { EventsList } from "@/components/EventsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Booking } from "@/types/models";
import { Bell, BellDot, CalendarDays, User, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfilePage } from "@/components/ProfilePage";
import { SettingsPage } from "@/components/SettingsPage";
import { EventDetails } from "./EventDetails";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TravelRecommendations } from "@/components/TravelRecommendations";

type BookingWithRelations = Booking & {
  destinations: { name: string; image_url: string | null } | null;
  events: { title: string; image_url: string | null } | null;
};

const DashboardHome = ({ profile }: { profile: Profile }) => {
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const popularDestinations = destinations?.slice(0, 3) || [];
  const upcomingEvents = events?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {getGreeting()}, {profile.username || profile.email.split('@')[0]}!
      </h1>

      <TravelRecommendations />

      <div className="space-y-6">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Popular Destinations</h2>
            <button 
              onClick={() => navigate('/dashboard/destinations')}
              className="text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {isLoadingDestinations ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  id={destination.id}
                  image={destination.image_url || "https://images.unsplash.com/photo-1501286353178-1ec881214838"}
                  title={destination.name}
                  description={destination.description || ""}
                  price={`$${destination.price}`}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <button 
              onClick={() => navigate('/dashboard/events')}
              className="text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {isLoadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <DestinationCard
                  key={event.id}
                  id={event.id}
                  image={event.image_url || "https://images.unsplash.com/photo-1472396961693-142e6e269027"}
                  title={event.title}
                  description={event.description || ""}
                  price={event.price ? `$${event.price}` : "Free"}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const BookingsList = ({ bookings }: { bookings: BookingWithRelations[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Booking deleted",
        description: "Your booking has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Destination/Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>People</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                {booking.destinations?.name || booking.events?.title}
              </TableCell>
              <TableCell>
                {new Date(booking.booking_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status.toUpperCase()}
                </span>
              </TableCell>
              <TableCell>{booking.number_of_people}</TableCell>
              <TableCell>${booking.total_price.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <Button variant="default" size="sm">
                      Pay Now
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your booking.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteBookingMutation.mutate(booking.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!profile?.id) throw new Error("No profile ID");
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          destinations (name, image_url),
          events (title, image_url)
        `)
        .eq('user_id', profile.id);

      if (error) throw error;
      return data as BookingWithRelations[];
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (session) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const notifications = [
    {
      id: 1,
      title: "New Booking Confirmed",
      description: "Your recent booking has been confirmed.",
      time: "2 minutes ago",
    },
    {
      id: 2,
      title: "Upcoming Event",
      description: "Don't forget about your upcoming event tomorrow!",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
      time: "2 hours ago",
    },
  ];

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
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative"
                      onClick={() => setHasUnreadNotifications(false)}
                    >
                      {hasUnreadNotifications ? (
                        <BellDot className="h-5 w-5 text-primary" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold">Notifications</h4>
                    </div>
                    <ScrollArea className="h-80">
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 hover:bg-accent transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-medium">{notification.title}</h5>
                              <span className="text-xs text-muted-foreground">
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <SidebarTrigger />
              </div>
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
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
