
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Review } from "@/types/models";

export const useReviews = (destinationId: string) => {
  return useQuery({
    queryKey: ["reviews", destinationId],
    queryFn: async () => {
      try {
        // First fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select(`
            id,
            user_id,
            destination_id,
            rating,
            comment,
            created_at,
            updated_at
          `)
          .eq("destination_id", destinationId)
          .order("created_at", { ascending: false });

        if (reviewsError) {
          console.error("Error fetching reviews:", reviewsError);
          toast.error("Failed to fetch reviews");
          throw reviewsError;
        }

        // Then fetch profiles for the user_ids in the reviews
        const userIds = reviewsData.map(review => review.user_id);
        
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds);

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
            // Don't throw here, we can still return reviews without profiles
          }

          // Merge the profiles data with the reviews
          if (profilesData) {
            const reviewsWithProfiles = reviewsData.map(review => ({
              ...review,
              profiles: profilesData.find(profile => profile.id === review.user_id) || { 
                username: "Anonymous", 
                avatar_url: null 
              }
            }));
            
            return reviewsWithProfiles as Review[];
          }
        }
        
        // If no profiles were fetched, return reviews with default profile data
        return reviewsData.map(review => ({
          ...review,
          profiles: { username: "Anonymous", avatar_url: null }
        })) as Review[];
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
    mutationFn: async (review: Omit<Review, "id" | "created_at" | "updated_at" | "profiles">) => {
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
