import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { DestinationCard } from "@/components/DestinationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: destinations, isLoading: isLoadingDestinations } = useDestinations();
  const { data: events, isLoading: isLoadingEvents } = useEvents();

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
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (isLoadingDestinations || isLoadingEvents) {
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
      <h1 className="text-4xl font-display font-bold mb-8">Welcome to Zimbabwe Tourism</h1>
      
      <Tabs defaultValue="destinations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="destinations">Tourist Destinations</TabsTrigger>
          <TabsTrigger value="events">Local Events</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations?.map((destination) => (
              <DestinationCard
                key={destination.id}
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