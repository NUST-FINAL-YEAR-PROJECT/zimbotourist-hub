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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
import { useAuth } from "@/hooks/useAuth";

type BookingWithRelations = Booking & {
  destinations: { name: string; image_url: string | null } | null;
  events: { title: string; image_url: string | null } | null;
};

const NotificationItem = ({ notification, onRead }: { 
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
            <a 
              href="https://www.paynow.co.zw/Payment/BillPaymentLink/?q=aWQ9MTk4NTcmYW1vdW50PTAuMDAmYW1vdW50X3F1YW50aXR5PTAuMDA"
              target="_blank"
              className="flex-1 sm:flex-none"
            >
              <img 
                src="https://www.paynow.co.zw/Content/Buttons/Medium_buttons/button_pay-now_medium.png" 
                alt="PayNow"
                className="h-9 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      return profile;
    },
    enabled: !!user?.id,
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          destinations (
            name,
            image_url
          ),
          events (
            title,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return bookings;
    },
    enabled: !!user?.id,
  });

  if (!profile) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardHome profile={profile} bookings={bookings || []} />} />
            <Route path="/destinations" element={<DestinationExplorer />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};
