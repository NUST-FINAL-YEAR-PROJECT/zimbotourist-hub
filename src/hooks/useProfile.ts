
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/models";

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      // Return null if no profile was found
      if (!data) {
        console.warn(`No profile found for user ID: ${userId}`);
        return null;
      }
      
      return data as Profile;
    },
    enabled: !!userId,
    retry: 1, // Only retry once if there's an error
  });
};
