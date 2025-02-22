
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Destination } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";

export const useDestinations = () => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      try {
        if (!session) {
          throw new Error("Authentication required");
        }

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
          return [];
        }

        return data as Destination[];
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
