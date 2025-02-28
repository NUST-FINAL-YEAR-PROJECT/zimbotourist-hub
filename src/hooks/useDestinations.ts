
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Destination } from "@/types/models";

export const useDestinations = () => {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          toast.error("Failed to fetch destinations");
          throw error;
        }

        if (!data) {
          toast.error("No destinations found");
          return [];
        }

        return data as Destination[];
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch destinations");
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useDestination = (id: string) => {
  return useQuery({
    queryKey: ["destination", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          toast.error("Failed to fetch destination");
          throw error;
        }

        return data as Destination;
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch destination");
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
  });
};
