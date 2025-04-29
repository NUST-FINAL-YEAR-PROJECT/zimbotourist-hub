import { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { EventsList } from "@/components/EventsList";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Booking, AppNotification } from "@/types/models";
import { Bell, BellDot, CalendarDays, Trash2, LayoutDashboard, Activity, MapPin, Calendar, Clock, Users, CheckCircle, AlertTriangle, Info } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion, AnimatePresence } from "framer-motion";
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
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 transition-all duration-300"
  >
    <div className="flex items-center space-x-2 sm:space-x-4">
      <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
        {description && <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">{description}</p>}
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
  
  // Determine icon and style based on notification type
  const getIconForType = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getBgColor = () => {
    if (!isUnread) return "bg-white hover:bg-gray-50";
    
    switch (notification.type) {
      case 'success': return "bg-green-50 hover:bg-green-100";
      case 'error': return "bg-red-50 hover:bg-red-100";
      case 'warning': return "bg-amber-50 hover:bg-amber-100";
      default: return "bg-blue-50 hover:bg-blue-100";
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "p-4 transition-all cursor-pointer rounded-lg mb-3 border shadow-sm",
        getBgColor(),
        isUnread ? "border-l-4 border-l-indigo-500" : "border-gray-100"
      )}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-1 rounded-full p-1",
          isUnread ? "bg-white" : "bg-gray-100"
        )}>
          {getIconForType()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h5 className={cn(
              "font-medium truncate",
              isUnread ? "text-gray-900" : "text-gray-700"
            )}>
              {notification.title}
            </h5>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {new Date(notification.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className={cn(
            "text-sm line-clamp-2", 
            isUnread ? "text-gray-700" : "text-muted-foreground"
          )}>
            {notification.description}
          </p>
        </div>
      </div>
      {isUnread && (
        <div className="flex justify-end mt-2">
          <Badge variant="outline" className="text-xs bg-white">New</Badge>
        </div>
      )}
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
    markAsRead,
    markAllAsRead,
    unreadCount
  } = useNotifications(profile?.id);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
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
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 sm:p-6 rounded-xl text-white shadow-md"
      >
        <h1 className="text-lg sm:text-3xl font-bold">
          {getGreeting()}, {profile.username || profile.email.split('@')[0]}!
        </h1>
        <p className="text-sm opacity-90 mt-1">
          Here's what's happening with your travel plans
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size={isMobile ? "sm" : "default"} className="relative bg-white hover:bg-indigo-50 border-gray-200 shadow-sm">
              {unreadCount > 0 ? (
                <BellDot className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 mr-2" />
              ) : (
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              )}
              {isMobile ? "" : "Notifications"}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 text-xs text-white flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "mobile-sheet-content" : "w-full sm:max-w-md"}>
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Bell className="h-5 w-5 text-indigo-600" /> Notifications
              </SheetTitle>
            </SheetHeader>
            <div className="flex justify-between items-center mt-4 mb-2 px-1">
              <p className="text-sm text-muted-foreground">
                {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
              </p>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs hover:bg-indigo-50 text-indigo-600"
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <ScrollArea className="mt-2 pr-4 h-[calc(100vh-8rem)]">
              <AnimatePresence mode="popLayout">
                {isLoadingNotifications ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2 mb-3 border rounded-lg">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))
                ) : notifications?.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-medium mb-2">No notifications yet</p>
                    <p className="text-sm">We'll notify you when there's activity related to your account</p>
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <AnimatePresence>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={isMobile && index > 1 ? "col-span-1" : ""}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {bookings.length > 0 && (
        <Card className="overflow-hidden border bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-6">
            <CardTitle className="flex items-center text-sm sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Your latest travel arrangements</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="space-y-2 sm:space-y-4">
              {bookings.slice(0, 3).map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (index * 0.1), duration: 0.4 }}
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                  className="p-3 rounded-lg border bg-card text-card-foreground hover:border-indigo-200 shadow-sm transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-sm">
                        {booking.destinations?.name || booking.events?.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
              
              {bookings.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/dashboard/bookings")} 
                  className="w-full mt-2 text-sm text-indigo-600 hover:bg-indigo-50 border-dashed"
                >
                  View all bookings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

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
      <div className="flex min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex-1 p-3 sm:p-8">
          <div className="container mx-auto space-y-4 sm:space-y-8">
            <Skeleton className="h-12 w-full max-w-md rounded-xl mb-4 sm:mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 sm:h-32 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[200px] sm:h-[500px] w-full rounded-xl mt-4 sm:mt-8" />
          </div>
        </div>
        {isMobile && <div className="h-16" />}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {!isMobile && <AppSidebar />}
      <div className={cn(
        "flex-1 overflow-auto",
        isMobile && "mobile-dashboard-content pb-16"
      )}>
        <div className="container mx-auto py-3 sm:py-6 px-3 sm:px-6 min-h-screen overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-3 sm:mb-6"
          >
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <LayoutDashboard className="h-4 w-4 sm:h-6 sm:w-6 mr-2 text-indigo-600" />
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              {!isMobile && <SidebarTrigger />}
            </div>
          </motion.div>

          <div className="mobile-safe-scroll">
            <Routes>
              <Route
                path="/"
                element={<DashboardHome profile={profile} bookings={bookings} />}
              />
              <Route path="/destinations" element={<DestinationExplorer />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/bookings" element={<MyBookings />} />
            </Routes>
          </div>
        </div>
      </div>
      {isMobile && <AppSidebar />}
      <ChatAssistant />
    </div>
  );
};
