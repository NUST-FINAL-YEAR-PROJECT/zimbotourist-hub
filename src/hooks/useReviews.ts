
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Review } from "@/types/models";

// Helper function to check if storage bucket exists
async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error checking storage buckets:", bucketsError);
      return false;
    }
    
    return buckets.some(b => b.name === bucketName);
  } catch (error) {
    console.error("Error checking if bucket exists:", error);
    return false;
  }
}

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
        try {
          // Check if bucket exists before attempting to upload
          const bucketName = 'review-images';
          let bucketExists = await checkBucketExists(bucketName);
          
          if (!bucketExists) {
            // Try to create the bucket if it doesn't exist
            const { data: newBucket, error: createError } = await supabase.storage.createBucket(
              bucketName,
              { public: true } // Make bucket public so images are accessible
            );
            
            if (createError) {
              console.error("Failed to create bucket:", createError);
              toast.error("Image storage not available. Your review text will still be submitted.");
            } else {
              bucketExists = true;
            }
          }
          
          if (bucketExists) {
            // Try to upload each image
            for (const image of images) {
              // Validate the file
              if (!image || !image.name) {
                console.warn("Invalid image file detected, skipping");
                continue;
              }

              // Validate file size (max 5MB)
              if (image.size > 5 * 1024 * 1024) {
                toast.error(`Image ${image.name} exceeds the 5MB size limit`);
                continue;
              }

              // Sanitize filename to prevent issues
              const timestamp = Date.now();
              const fileExt = image.name.split('.').pop();
              const safeFileName = `${review.user_id.substring(0, 8)}-${timestamp}.${fileExt}`;
              
              const { data: uploadResult, error: uploadError } = await supabase
                .storage
                .from(bucketName)
                .upload(safeFileName, image);
                
              if (uploadError) {
                console.error("Error uploading image:", uploadError);
                toast.error(`Failed to upload an image, but your review will still be submitted`);
                continue; // Continue with other images
              }
              
              if (uploadResult) {
                // Get public URL for the uploaded image
                const { data: { publicUrl } } = supabase
                  .storage
                  .from(bucketName)
                  .getPublicUrl(uploadResult.path);
                  
                uploadedImageURLs.push(publicUrl);
              }
            }
          }
        } catch (err) {
          console.error("Error during image upload:", err);
          toast.error("Failed to upload images, but your review will still be submitted");
        }
      }
      
      // Create the review, even if image uploads failed
      try {
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
      } catch (err) {
        console.error("Unexpected error creating review:", err);
        toast.error("An unexpected error occurred. Please try again.");
        throw err;
      }
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
      try {
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
          // Check if bucket exists before attempting to upload
          const bucketExists = await checkBucketExists('review-images');
          
          if (!bucketExists) {
            console.error("Review images bucket does not exist. Please check storage policies.");
            toast.error("Image storage not available. Your review text will still be updated.");
          } else {
            for (const image of newImages) {
              // Validate image before upload
              if (!image || !image.name) {
                console.warn("Invalid image file detected, skipping");
                continue;
              }
              
              // Validate file size
              if (image.size > 5 * 1024 * 1024) {
                toast.error(`Image ${image.name} exceeds the 5MB size limit`);
                continue;
              }

              // Sanitize filename to prevent issues
              const timestamp = Date.now();
              const fileExt = image.name.split('.').pop();
              const safeFileName = `update-${timestamp}.${fileExt}`;
              
              try {
                const { data: uploadResult, error: uploadError } = await supabase
                  .storage
                  .from('review-images')
                  .upload(safeFileName, image);
                  
                if (uploadError) {
                  console.error("Error uploading image:", uploadError);
                  toast.error(`Failed to upload an image, but your review will still be updated`);
                  continue;
                }
                
                if (uploadResult) {
                  // Get public URL for the uploaded image
                  const { data: { publicUrl } } = supabase
                    .storage
                    .from('review-images')
                    .getPublicUrl(uploadResult.path);
                    
                  uploadedImageURLs.push(publicUrl);
                }
              } catch (err) {
                console.error("Unexpected error during image upload:", err);
              }
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
      } catch (error) {
        console.error("Error in update review process:", error);
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
