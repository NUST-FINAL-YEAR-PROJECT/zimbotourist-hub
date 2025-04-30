
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/types/models";

export const useDestinations = () => {
  const { toast } = useToast();
  
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
          toast({
            title: "Failed to fetch destinations",
            description: error.message,
            variant: "destructive"
          });
          throw error;
        }

        if (!data) {
          toast({
            title: "No destinations found",
            description: "Please try again later",
            variant: "destructive"
          });
          return [];
        }

        return data as Destination[];
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Failed to fetch destinations",
          description: "Please check your connection and try again",
          variant: "destructive"
        });
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useDestination = (id: string) => {
  const { toast } = useToast();
  
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
          toast({
            title: "Failed to fetch destination",
            description: error.message,
            variant: "destructive"
          });
          throw error;
        }

        return data as Destination;
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Failed to fetch destination",
          description: "Please check your connection and try again",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
  });
};
