
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/models";

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      
      // Make sure we have a valid session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Session error in useProfile:", sessionError);
        throw new Error("No valid session found. Please log in again.");
      }
      
      // Fetch profile with valid session
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
    retry: 3, // Retry up to 3 times if there's an error
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
