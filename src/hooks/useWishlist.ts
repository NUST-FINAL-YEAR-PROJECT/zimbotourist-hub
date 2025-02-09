
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWishlist = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("wishlists")
        .select("destination_id")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Failed to fetch wishlist");
        throw error;
      }

      return data.map(item => item.destination_id);
    },
    enabled: !!userId,
  });

  const addToWishlist = useMutation({
    mutationFn: async (destinationId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: userId, destination_id: destinationId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      toast.success("Added to wishlist");
    },
    onError: (error: Error) => {
      toast.error("Failed to add to wishlist");
      console.error("Error adding to wishlist:", error);
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (destinationId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("destination_id", destinationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      toast.success("Removed from wishlist");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove from wishlist");
      console.error("Error removing from wishlist:", error);
    },
  });

  return {
    wishlist: wishlist || [],
    isLoading,
    addToWishlist,
    removeFromWishlist,
  };
};
