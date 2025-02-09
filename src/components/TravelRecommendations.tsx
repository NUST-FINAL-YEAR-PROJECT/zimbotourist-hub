
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Map, Calendar, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TravelPreferences {
  interests: string[];
  budget: string;
  travelStyle: string;
  duration: string;
}

export const TravelRecommendations = () => {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    interests: [],
    budget: "medium",
    travelStyle: "balanced",
    duration: "1 week"
  });
  const { toast } = useToast();

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ["travel-recommendations", preferences],
    queryFn: async () => {
      try {
        const { data: userBookings } = await supabase
          .from("bookings")
          .select("destination_id, created_at")
          .order("created_at", { ascending: false });

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-travel-recommendations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              preferences,
              travelHistory: userBookings
            })
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        return JSON.parse(data.recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast({
          title: "Error",
          description: "Failed to fetch travel recommendations",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: false
  });

  const handleGetRecommendations = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Travel Recommendations</h2>
        <Button 
          onClick={handleGetRecommendations}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting recommendations...
            </>
          ) : (
            "Get Personalized Recommendations"
          )}
        </Button>
      </div>

      {recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Recommended Destinations</h3>
            </div>
            <ul className="list-disc list-inside space-y-2">
              {recommendations.destinations.map((dest: string, i: number) => (
                <li key={i}>{dest}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Suggested Activities</h3>
            </div>
            <ul className="list-disc list-inside space-y-2">
              {recommendations.activities.map((activity: string, i: number) => (
                <li key={i}>{activity}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Travel Tips</h3>
            </div>
            <ul className="list-disc list-inside space-y-2">
              {recommendations.tips.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};
