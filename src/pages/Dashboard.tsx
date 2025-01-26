import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { DestinationCard } from "@/components/DestinationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Booking } from "@/types/models";
import { useQuery } from "@tanstack/react-query";

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
      <div className="container mx-auto py-8 space-y-4">
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
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>{profile.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.username || 'Welcome!'}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="destinations">Tourist Destinations</TabsTrigger>
          <TabsTrigger value="events">Local Events</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          {bookings && bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="space-y-4">
                    <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
                      <img
                        src={booking.destinations?.image_url || booking.events?.image_url || "/placeholder.svg"}
                        alt={booking.destinations?.name || booking.events?.title || "Booking"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.destinations?.name || booking.events?.title}
                      </h3>
                      <p className="text-muted-foreground">
                        Date: {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        Status: <span className="capitalize">{booking.status}</span>
                      </p>
                      <p className="text-muted-foreground">
                        People: {booking.number_of_people}
                      </p>
                      <p className="font-semibold mt-2">
                        Total: ${booking.total_price}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No bookings found</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="destinations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations?.map((destination) => (
              <DestinationCard
                key={destination.id}
                id={destination.id}
                image={destination.image_url || "/placeholder.svg"}
                title={destination.name}
                description={destination.description || ""}
                price={`$${destination.price}`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};