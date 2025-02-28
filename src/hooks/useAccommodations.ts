
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Accommodation } from "@/types/models";

export const useAccommodations = (destinationId?: string) => {
  return useQuery({
    queryKey: ["accommodations", destinationId],
    queryFn: async () => {
      let query = supabase
        .from("accommodations")
        .select("*");
      
      if (destinationId) {
        // If we're using this in a destination context, filter by destinationId
        query = query.eq("destination_id", destinationId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching accommodations:", error);
        throw error;
      }
      
      return data as Accommodation[];
    },
  });
};

export const useAccommodation = (id: string) => {
  return useQuery({
    queryKey: ["accommodation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching accommodation:", error);
        throw error;
      }
      
      return data as Accommodation;
    },
    enabled: !!id,
  });
};
