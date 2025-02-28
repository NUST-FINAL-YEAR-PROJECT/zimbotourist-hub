
import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Star, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ReviewSectionProps {
  destinationId?: string;
  accommodationId?: string;
  userId?: string;
}

// Define a separate type for reviews with profile information
interface ReviewWithProfile {
  id: string;
  user_id: string;
  destination_id?: string;
  accommodation_id?: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const ReviewSection = ({ destinationId, accommodationId, userId }: ReviewSectionProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", destinationId || accommodationId],
    queryFn: async (): Promise<ReviewWithProfile[]> => {
      // First fetch reviews - use the correct field based on whether it's a destination or accommodation
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
        .eq("destination_id", destinationId || accommodationId);

      if (reviewsError) throw reviewsError;
      
      if (!reviewsData || reviewsData.length === 0) {
        return [];
      }

      // Then fetch profiles for the user_ids in the reviews
      const userIds = reviewsData.map((review) => review.user_id);
      
      // Only fetch profiles if there are reviews
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Merge the profiles data with the reviews
        return reviewsData.map((review) => ({
          ...review,
          profiles: profilesData?.find((profile) => profile.id === review.user_id) || null
        }));
      }
      
      return reviewsData as ReviewWithProfile[];
    },
    enabled: !!destinationId || !!accommodationId,
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reviews")
        .insert({
          user_id: userId,
          destination_id: destinationId,
          rating,
          comment,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", destinationId || accommodationId] });
      setComment("");
      setRating(5);
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reviews")
        .update({ rating, comment })
        .eq("id", editingReviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", destinationId || accommodationId] });
      setEditingReviewId(null);
      setComment("");
      setRating(5);
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", destinationId || accommodationId] });
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReviewId) {
      updateReviewMutation.mutate();
    } else {
      createReviewMutation.mutate();
    }
  };

  const handleEdit = (review: ReviewWithProfile) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
  };

  const handleDelete = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId);
  };

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Reviews</h3>
      
      {userId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="min-h-[100px]"
          />
          
          <Button type="submit" disabled={!comment.trim()}>
            {editingReviewId ? "Update Review" : "Submit Review"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-lg p-4 space-y-2 bg-white/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {review.profiles?.username || "Anonymous"}
                  </span>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.created_at), "MMM d, yyyy")}
                </span>
              </div>
              
              <p className="text-gray-700">{review.comment}</p>
              
              {userId === review.user_id && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(review)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
        )}
      </div>
    </div>
  );
};
