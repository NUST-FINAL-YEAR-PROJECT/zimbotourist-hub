
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
            images,
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
    mutationFn: async ({ review, images }: { 
      review: Omit<Review, "id" | "created_at" | "updated_at" | "profiles" | "images">, 
      images: File[] 
    }) => {
      // Upload images first if any
      const uploadedImageURLs: string[] = [];
      
      if (images && images.length > 0) {
        for (const image of images) {
          // Make sure the file is valid before attempting upload
          if (!image || !image.name) {
            console.warn("Invalid image file detected, skipping");
            continue;
          }

          const fileName = `${review.user_id}-${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-_]/g, '_')}`;
          
          const { data: uploadResult, error: uploadError } = await supabase
            .storage
            .from('review-images')
            .upload(fileName, image);
            
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast.error(`Failed to upload image: ${image.name}`);
            throw uploadError;
          }
          
          if (uploadResult) {
            // Get public URL for the uploaded image
            const { data: { publicUrl } } = supabase
              .storage
              .from('review-images')
              .getPublicUrl(uploadResult.path);
              
            uploadedImageURLs.push(publicUrl);
          }
        }
      }
      
      // Then create the review with image URLs
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          ...review,
          images: uploadedImageURLs.length > 0 ? uploadedImageURLs : null
        })
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
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.review.destination_id] });
      toast.success("Review submitted successfully!");
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      reviewData, 
      destinationId, 
      newImages 
    }: { 
      reviewId: string, 
      reviewData: { rating: number, comment: string }, 
      destinationId: string,
      newImages: File[]
    }) => {
      // Get existing review to access current images
      const { data: existingReview, error: fetchError } = await supabase
        .from("reviews")
        .select("images")
        .eq("id", reviewId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching existing review:", fetchError);
        throw fetchError;
      }
      
      // Handle existing images - ensure it's an array
      const existingImages = existingReview?.images || [];
      
      // Upload any new images
      const uploadedImageURLs: string[] = [];
      
      if (newImages && newImages.length > 0) {
        for (const image of newImages) {
          // Validate image before upload
          if (!image || !image.name) {
            console.warn("Invalid image file detected, skipping");
            continue;
          }

          const fileName = `update-${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-_]/g, '_')}`;
          
          const { data: uploadResult, error: uploadError } = await supabase
            .storage
            .from('review-images')
            .upload(fileName, image);
            
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast.error(`Failed to upload image: ${image.name}`);
            throw uploadError;
          }
          
          if (uploadResult) {
            // Get public URL for the uploaded image
            const { data: { publicUrl } } = supabase
              .storage
              .from('review-images')
              .getPublicUrl(uploadResult.path);
              
            uploadedImageURLs.push(publicUrl);
          }
        }
      }
      
      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageURLs];
      
      // Update the review
      const { error } = await supabase
        .from("reviews")
        .update({ 
          ...reviewData, 
          images: allImages.length > 0 ? allImages : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", reviewId);

      if (error) {
        console.error("Error updating review:", error);
        toast.error("Failed to update review");
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.destinationId] });
      toast.success("Review updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error updating review: ${error.message}`);
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reviewId, destinationId }: { reviewId: string, destinationId: string }) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) {
        console.error("Error deleting review:", error);
        toast.error("Failed to delete review");
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.destinationId] });
      toast.success("Review deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error deleting review: ${error.message}`);
    },
  });
};
