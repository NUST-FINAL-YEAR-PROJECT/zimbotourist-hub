
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews, useCreateReview, useUpdateReview, useDeleteReview } from "@/hooks/useReviews";
import { Star, Edit, Trash2, Plus, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
  destinationId: string;
}

export const ReviewSection = ({ destinationId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewImageIndex, setViewImageIndex] = useState<number | null>(null);
  const [viewingReview, setViewingReview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: reviews, isLoading } = useReviews(destinationId);
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      
      // Limit to 5 images total
      if (selectedImages.length + fileList.length > 5) {
        toast({
          title: "Too many images",
          description: "You can upload maximum 5 images per review",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImages(prev => [...prev, ...fileList]);
      
      // Create preview URLs
      const newPreviewUrls = fileList.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Also remove preview
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setComment("");
    setRating(5);
    setSelectedImages([]);
    setPreviewImages(prev => {
      // Revoke all object URLs to prevent memory leaks
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
    setEditingReviewId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingReviewId) {
        await updateReviewMutation.mutateAsync({
          reviewId: editingReviewId,
          reviewData: { rating, comment },
          destinationId,
          newImages: selectedImages
        });
      } else {
        await createReviewMutation.mutateAsync({
          review: {
            user_id: user.id,
            destination_id: destinationId,
            rating,
            comment
          },
          images: selectedImages
        });
      }
      
      resetForm();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: any) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
    setSelectedImages([]);
    setPreviewImages([]);
    
    // Scroll to review form
    document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate({ reviewId, destinationId });
    }
  };
  
  const handleViewImages = (reviewId: string, imageIndex: number) => {
    setViewingReview(reviewId);
    setViewImageIndex(imageIndex);
  };
  
  const closeImageViewer = () => {
    setViewingReview(null);
    setViewImageIndex(null);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Reviews & Experiences</h2>
      
      {user && (
        <div id="review-form" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-lg">
            {editingReviewId ? "Edit Your Review" : "Share Your Experience"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        value <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="comment" className="text-sm font-medium">Your Comments</label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this destination..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Photos</label>
              <div className="flex flex-wrap gap-2 items-center">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="h-20 w-20 rounded overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
                
                {previewImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center h-20 w-20 border border-dashed border-gray-300 rounded text-gray-400 hover:text-primary hover:border-primary transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <p className="text-xs text-gray-500">
                Upload up to 5 images (max 5MB each)
              </p>
            </div>
            
            <div className="flex gap-4 pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || !comment.trim()} 
                className="px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  editingReviewId ? "Update Review" : "Submit Review"
                )}
              </Button>
              
              {editingReviewId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={review.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.profiles?.username?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {review.profiles?.username || "Anonymous"}
                      </div>
                      <div className="flex mt-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </div>
                </div>
                
                {review.comment && (
                  <div className="text-gray-700 leading-relaxed">{review.comment}</div>
                )}
                
                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {review.images.map((image, index) => (
                      <div 
                        key={index}
                        className="relative cursor-pointer overflow-hidden rounded-md w-20 h-20 bg-gray-100"
                        onClick={() => handleViewImages(review.id, index)}
                      >
                        <img 
                          src={image} 
                          alt={`Review image ${index + 1}`} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {user?.id === review.user_id && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(review)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-4">
              <ImageIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Be the first to share your experience at this destination and help others plan their trip.
            </p>
            
            {!user && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = "/auth"}
              >
                Sign in to leave a review
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Full-screen image viewer dialog */}
      <Dialog open={viewingReview !== null} onOpenChange={closeImageViewer}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <DialogHeader className="p-4">
            <DialogTitle className="text-white">Review Images</DialogTitle>
          </DialogHeader>
          
          {viewingReview && reviews?.find(r => r.id === viewingReview)?.images && (
            <Carousel 
              className="w-full max-h-[80vh]"
              defaultIndex={viewImageIndex || 0}
            >
              <CarouselContent>
                {reviews.find(r => r.id === viewingReview)?.images?.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="flex items-center justify-center p-2">
                      <img
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="max-h-[70vh] max-w-full object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
