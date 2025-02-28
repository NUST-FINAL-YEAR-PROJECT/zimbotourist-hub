
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

export const useEvent = (id: string | undefined) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Event not found");
      }

      return data as Event;
    },
    enabled: !!id,
  });
};
