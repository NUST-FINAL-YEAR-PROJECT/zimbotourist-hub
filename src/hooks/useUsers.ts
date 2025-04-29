
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string | null;
  username: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users from Supabase...");
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          // Handle rate limiting specifically
          if (error.message.includes("429") || error.message.includes("rate limit")) {
            console.error("Rate limit reached when fetching users. Please try again later:", error);
            throw new Error(`Rate limit reached. Please try again in a few moments.`);
          } else {
            console.error("Error fetching users:", error);
            throw new Error(`Failed to fetch users: ${error.message}`);
          }
        }

        if (!data || data.length === 0) {
          console.log("No users found in the database");
          return [];
        } else {
          console.log(`Successfully fetched ${data.length} users`, data);
        }

        return data as User[];
      } catch (err) {
        console.error("Unexpected error in useUsers hook:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent multiple fetches on mount
    staleTime: 60000 * 5, // 5 minutes - increased to reduce unnecessary fetches
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors, but retry other errors up to 2 times
      if (error instanceof Error && error.message.includes("Rate limit reached")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
