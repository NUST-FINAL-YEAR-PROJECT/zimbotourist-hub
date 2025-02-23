
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Destination } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";

export const useDestinations = () => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["destinations", session?.user?.id],
    queryFn: async () => {
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

      return data as Destination[];
    },
    enabled: !!session,
    retry: false,
  });
};
