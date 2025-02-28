
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Review } from "@/types/models";

export const useReviews = (destinationId: string) => {
  return useQuery({
    queryKey: ["reviews", destinationId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq("destination_id", destinationId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching reviews:", error);
          toast.error("Failed to fetch reviews");
          throw error;
        }

        return data as Review[];
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to fetch reviews");
        throw error;
      }
    },
    enabled: !!destinationId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: Omit<Review, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating review:", error);
        toast.error("Failed to create review");
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.destination_id] });
      toast.success("Review submitted successfully!");
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    },
  });
};
