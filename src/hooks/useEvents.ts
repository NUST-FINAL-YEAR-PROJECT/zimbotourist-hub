
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/types/models";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
};
