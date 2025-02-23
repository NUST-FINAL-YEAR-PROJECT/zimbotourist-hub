
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Event } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";

export const useEvents = () => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["events", session?.user?.id],
    queryFn: async () => {
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

      return data as Event[];
    },
    enabled: !!session,
    retry: false,
  });
};
