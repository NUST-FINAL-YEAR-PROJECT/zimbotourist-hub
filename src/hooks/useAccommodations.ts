
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Accommodation } from "@/types/models";
import { toast } from "sonner";

export const useAccommodations = (destinationId?: string) => {
  return useQuery({
    queryKey: ["accommodations", destinationId],
    queryFn: async () => {
      let query = supabase
        .from("accommodations")
        .select(`
          *,
          destinations (
            name,
            location
          )
        `)
        .order("created_at", { ascending: false });

      if (destinationId) {
        query = query.eq("destination_id", destinationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching accommodations:", error);
        toast.error("Failed to fetch accommodations");
        throw error;
      }

      return data as (Accommodation & {
        destinations?: {
          name: string;
          location: string;
        } | null;
      })[];
    },
  });
};
