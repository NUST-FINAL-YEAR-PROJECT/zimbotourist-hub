
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/types/models";
import { toast } from "sonner";

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
          toast.error("Failed to fetch events");
          throw error;
        }
        
        return data as Event[];
      } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
    },
  });
};
