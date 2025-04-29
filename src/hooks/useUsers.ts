
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No users found in the database");
      } else {
        console.log(`Successfully fetched ${data.length} users`);
      }

      return data as User[];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 30000, // 30 seconds
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
