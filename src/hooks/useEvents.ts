
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Event } from "@/types/models";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
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
          toast.error("No events found");
          return [];
        }

        return data as Event[];
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch events");
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};
