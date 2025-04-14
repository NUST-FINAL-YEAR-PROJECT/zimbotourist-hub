
import { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { EventsList } from "@/components/EventsList";
import { AccommodationsList } from "@/components/AccommodationsList";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Booking, AppNotification } from "@/types/models";
import { Bell, BellDot, CalendarDays, Trash2, LayoutDashboard, Activity, MapPin, Calendar, Clock, Users } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsPage } from "@/components/SettingsPage";
import { EventDetails } from "./EventDetails";
import { PaymentPage } from "./PaymentPage";
import { ChatAssistant } from "@/components/ChatAssistant";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TravelRecommendations } from "@/components/TravelRecommendations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MyBookings } from "./MyBookings";

type BookingWithRelations = Booking & {
  destinations: {
    name: string;
    image_url: string | null;
  } | null;
  events: {
    title: string;
    image_url: string | null;
  } | null;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  description
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
}) => (
  <motion.div 
    whileHover={{ y: -5 }} 
    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 transition-all duration-300"
  >
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  </motion.div>
);

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
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-4 hover:bg-accent/50 transition-all cursor-pointer rounded-lg mb-2 border-l-4",
        isUnread ? "bg-primary/5 border-primary" : "border-transparent"
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

const DashboardHome = ({
  profile,
  bookings
}: {
  profile: Profile;
  bookings: BookingWithRelations[];
}) => {
  const {
    notifications,
    isLoading: isLoadingNotifications,
    markAsRead
  } = useNotifications(profile?.id);
  const navigate = useNavigate();
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  
  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
      description: "Across all destinations"
    }, 
    {
      title: "Upcoming Trips",
      value: bookings.filter(b => new Date(b.booking_date) > new Date()).length,
      icon: Clock,
      description: "Scheduled for the future"
    }, 
    {
      title: "Destinations Visited",
      value: new Set(bookings.map(b => b.destination_id)).size,
      icon: MapPin,
      description: "Unique places explored"
    }, 
    {
      title: "Total Travelers",
      value: bookings.reduce((acc, b) => acc + b.number_of_people, 0),
      icon: Users,
      description: "People in your bookings"
    }
  ];
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary/80 to-primary p-6 rounded-xl text-white shadow-lg"
        >
          <h1 className="text-2xl sm:text-3xl font-bold">
            {getGreeting()}, {profile.username || profile.email.split('@')[0]}!
          </h1>
          <p className="text-sm sm:text-base opacity-90 mt-1">
            Here's what's happening with your travel plans
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                {unreadCount > 0 ? <BellDot className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" /> : <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                Notifications
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className="text-xl">Notifications</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
                <AnimatePresence mode="popLayout">
                  {isLoadingNotifications ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 space-y-2 mb-2 border rounded-lg">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))
                  ) : notifications?.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications?.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={id => markAsRead.mutate(id)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex flex-wrap gap-2">
            
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-primary data-[state=active]:text-white">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <StatCard {...stat} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {bookings.length > 0 && (
              <Card className="overflow-hidden border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Recent Bookings
                  </CardTitle>
                  <CardDescription>Your latest travel arrangements</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1), duration: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">
                              {booking.destinations?.name || booking.events?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                            {booking.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            <TravelRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const DestinationCard = ({
  id,
  image,
  title,
  description,
  price
}: {
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
      whileHover={{
        scale: isMobile ? 1 : 1.05
      }} 
      transition={{
        duration: 0.2
      }} 
      className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-white dark:bg-gray-800" 
      onClick={() => navigate(`/destinations/${id}`)}
    >
      <div className="relative h-36 sm:h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-primary text-white">{price}</Badge>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
};

const BookingsList = ({
  bookings
}: {
  bookings: BookingWithRelations[];
}) => {
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const {
        error
      } = await supabase.from("bookings").delete().eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"]
      });
      toast({
        title: "Booking deleted",
        description: "Your booking has been successfully deleted."
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });
  
  const handlePayNow = (bookingId: string) => {
    navigate(`/dashboard/payment?booking_id=${bookingId}`);
  };
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        <AnimatePresence>
          {bookings.map((booking, index) => (
            <motion.div 
              key={booking.id} 
              initial={{
                opacity: 0,
                y: 20
              }} 
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -20
              }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3 border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">
                  {booking.destinations?.name || booking.events?.title}
                </h3>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' : 
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' : 
                  'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                )}>
                  {booking.status}
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
                  <Button variant="default" size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={() => handlePayNow(booking.id)}>
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
                      <AlertDialogAction className="flex-1" onClick={() => deleteBookingMutation.mutate(booking.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }
  
  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <CardTitle>Your Bookings</CardTitle>
        <CardDescription>Manage your travel plans</CardDescription>
      </CardHeader>
      <div className="rounded-b-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80 dark:bg-gray-900/80">
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
            <AnimatePresence>
              {bookings.map((booking, index) => (
                <motion.tr 
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border-b border-gray-100 dark:border-gray-800"
                  style={{ display: 'table-row' }}
                >
                  <TableCell className="font-medium">
                    {booking.destinations?.name || booking.events?.title}
                  </TableCell>
                  <TableCell>
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' : 
                      'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                    )}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>{booking.number_of_people}</TableCell>
                  <TableCell>${booking.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' && (
                        <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handlePayNow(booking.id)}>
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
                            <AlertDialogAction onClick={() => deleteBookingMutation.mutate(booking.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

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
    enabled: !!profile?.id
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            variant: "destructive",
            title: "Not authenticated",
            description: "Please sign in to access the dashboard"
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
          navigate("/auth");
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto space-y-8">
            <Skeleton className="h-16 w-full max-w-md rounded-xl mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[500px] w-full rounded-xl mt-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-800">
      <AppSidebar />
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-screen overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center">
              <LayoutDashboard className="h-6 w-6 mr-2 text-primary" />
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
          </motion.div>

          <Routes>
            <Route
              path="/"
              element={<DashboardHome profile={profile} bookings={bookings} />}
            />
            <Route path="/destinations" element={<DestinationExplorer />} />
            <Route path="/accommodations" element={<AccommodationsList />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/bookings" element={<MyBookings />} />
          </Routes>
        </div>
      </div>
      <ChatAssistant />
    </div>
  );
};
