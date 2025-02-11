import { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { EventsList } from "@/components/EventsList";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Booking, AppNotification } from "@/types/models";
import { Bell, BellDot, CalendarDays, User, Trash2, LayoutDashboard } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsPage } from "@/components/SettingsPage";
import { EventDetails } from "./EventDetails";
import { PaymentPage } from "./PaymentPage";
import { ChatAssistant } from "@/components/ChatAssistant";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TravelRecommendations } from "@/components/TravelRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion } from "framer-motion";

type BookingWithRelations = Booking & {
  destinations: { name: string; image_url: string | null } | null;
  events: { title: string; image_url: string | null } | null;
};

const NotificationItem = ({ 
  notification, 
  onRead 
}: { 
  notification: AppNotification; 
  onRead: (id: string) => void; 
}) => {
  const isUnread = !notification.is_read;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "p-4 hover:bg-accent/50 transition-all cursor-pointer rounded-lg",
        isUnread && "bg-primary/5"
      )}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex justify-between items-start mb-1">
        <h5 className="font-medium">{notification.title}</h5>
        <span className="text-xs text-muted-foreground">
          {new Date(notification.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {notification.description}
      </p>
    </motion.div>
  );
};

const DestinationCard = ({ id, image, title, description, price }: {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <motion.div
      whileHover={{ scale: isMobile ? 1 : 1.05 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => navigate(`/destinations/${id}`)}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-36 sm:h-48 object-cover"
      />
      <div className="p-3 sm:p-4 bg-white">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 line-clamp-2">{description}</p>
        <div className="mt-2 sm:mt-3 flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-700 font-medium">{price}</span>
        </div>
      </div>
    </motion.div>
  );
};

const DashboardHome = ({ profile, bookings }: { profile: Profile; bookings: BookingWithRelations[] }) => {
  const { notifications, isLoading: isLoadingNotifications, markAsRead } = useNotifications(profile?.id);
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const navigate = useNavigate();
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const isMobile = useIsMobile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const popularDestinations = destinations?.slice(0, 3) || [];
  const upcomingEvents = events?.slice(0, 3) || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {profile.username || profile.email.split('@')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with your travel plans.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "icon"}
                className="relative"
              >
                {unreadCount > 0 ? (
                  <BellDot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                ) : (
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-[10px] sm:text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                <div className="divide-y">
                  {isLoadingNotifications ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))
                  ) : notifications?.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications?.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={(id) => markAsRead.mutate(id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex flex-wrap gap-2">
            <Button 
              onClick={() => navigate('/dashboard/destinations')}
              size={isMobile ? "sm" : "default"}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              Browse Destinations
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/events')}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              View Events
            </Button>
          </div>
        </div>
      </div>

      <TravelRecommendations />

      <div className="space-y-4 sm:space-y-6">
        <section>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-2xl font-bold">Popular Destinations</h2>
            <button 
              onClick={() => navigate('/dashboard/destinations')}
              className="text-sm sm:text-base text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {isLoadingDestinations ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[250px] sm:h-[300px] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-2xl font-bold">Upcoming Events</h2>
            <button 
              onClick={() => navigate('/dashboard/events')}
              className="text-sm sm:text-base text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {isLoadingEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[250px] sm:h-[300px] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const handlePayNow = (bookingId: string) => {
    navigate(`/dashboard/payment?booking_id=${bookingId}`);
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 space-y-3 border border-gray-200/50"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium">
                {booking.destinations?.name || booking.events?.title}
              </h3>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              )}>
                {booking.status.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Date</div>
              <div>{new Date(booking.booking_date).toLocaleDateString()}</div>
              <div className="text-muted-foreground">People</div>
              <div>{booking.number_of_people}</div>
              <div className="text-muted-foreground">Price</div>
              <div>${booking.total_price.toFixed(2)}</div>
            </div>
            <div className="flex gap-2 pt-2">
              {booking.status === 'pending' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handlePayNow(booking.id)}
                >
                  Pay Now
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95%] max-w-md mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your booking.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="flex-1"
                      onClick={() => deleteBookingMutation.mutate(booking.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200/50 bg-white/50 backdrop-blur-sm">
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
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {booking.status.toUpperCase()}
                </span>
              </TableCell>
              <TableCell>{booking.number_of_people}</TableCell>
              <TableCell>${booking.total_price.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handlePayNow(booking.id)}
                    >
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
  
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          destinations (name, image_url),
          events (title, image_url)
        `)
        .eq('user_id', profile.id);

      if (error) throw error;
      return (data || []) as BookingWithRelations[];
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

  if (isLoadingBookings || !profile) {
    return (
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-8">
          <div className="container mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
    );
  }

  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50/50">
      <AppSidebar />
      <div className="flex-1">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
          </motion.div>
          
          <Routes>
            <Route path="/" element={<DashboardHome profile={profile} bookings={bookings} />} />
            <Route path="/bookings" element={<BookingsList bookings={bookings} />} />
            <Route path="/destinations" element={<DestinationExplorer destinations={destinations || []} isLoading={false} />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Routes>
        </div>
      </div>
      <div className="fixed bottom-4 right-4">
        <a 
          href="https://www.paynow.co.zw/Payment/BillPaymentLink/?q=aWQ9MTk4NTcmYW1vdW50PTAuMDAmYW1vdW50X3F1YW50aXR5PTAuMDAmbD0w" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <img 
            src="https://www.paynow.co.zw/Content/Buttons/Medium_buttons/button_pay-now_medium.png" 
            alt="Pay now with Paynow" 
            className="w-auto h-12"
          />
        </a>
      </div>
      <ChatAssistant />
    </div>
  );
};
