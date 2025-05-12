
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/models";

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      
      // Retry mechanism for session
      let sessionAttempts = 0;
      let session = null;
      
      while (sessionAttempts < 3 && !session) {
        try {
          // Make sure we have a valid session first
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Session error attempt", sessionAttempts + 1, "in useProfile:", sessionError);
            sessionAttempts++;
            
            if (sessionAttempts < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * sessionAttempts));
              continue;
            }
            
            throw sessionError;
          }
          
          session = sessionData.session;
          
          if (!session) {
            console.warn("No session found on attempt", sessionAttempts + 1);
            sessionAttempts++;
            
            if (sessionAttempts < 3) {
              // Try to refresh the session
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (!refreshError && refreshData.session) {
                session = refreshData.session;
                break;
              }
              
              await new Promise(resolve => setTimeout(resolve, 1000 * sessionAttempts));
              continue;
            }
            
            throw new Error("No valid session found after multiple attempts");
          }
        } catch (error) {
          console.error("Error in session handling:", error);
          sessionAttempts++;
          
          if (sessionAttempts >= 3) {
            throw error;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * sessionAttempts));
        }
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
