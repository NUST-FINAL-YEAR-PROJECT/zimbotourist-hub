
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Event } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";

export const useEvents = () => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        if (!session) {
          throw new Error("Authentication required");
        }

        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_date", { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          toast.error("Failed to fetch events");
          throw error;
        }

        if (!data) {
          return [];
        }

        return data as Event[];
      } catch (error: any) {
        console.error("Fetch error:", error.message);
        toast.error(error.message);
        throw error;
      }
    },
    enabled: !!session, // Only run query when session exists
    retry: 1,
    retryDelay: 1000,
  });
};
