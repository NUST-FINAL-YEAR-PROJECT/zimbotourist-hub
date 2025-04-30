
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/types/models";

export const useDestinations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const query = useQuery({
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

  // Update type definition to make it more flexible
  type CreateDestinationInput = {
    name: string;
    location: string;
    price: number;
    description: string | null;
    image_url?: string | null;
    duration_recommended?: string | null;
    best_time_to_visit?: string | null;
    difficulty_level?: string | null;
    getting_there?: string | null;
    weather_info?: string | null;
    is_featured?: boolean;
    categories?: string[];
    additional_images?: string[];
    activities?: string[];
    amenities?: string[];
    what_to_bring?: string[];
    highlights?: string[];
    additional_costs?: Record<string, any> | null;
  };

  const createDestination = useMutation({
    mutationFn: async (newDestination: CreateDestinationInput) => {
      // Make sure we have null for empty values to satisfy Supabase types
      const destinationWithDefaults = {
        ...newDestination,
        description: newDestination.description || null,
        image_url: newDestination.image_url || null,
        duration_recommended: newDestination.duration_recommended || null,
        best_time_to_visit: newDestination.best_time_to_visit || null,
        difficulty_level: newDestination.difficulty_level || null,
        getting_there: newDestination.getting_there || null,
        weather_info: newDestination.weather_info || null,
        is_featured: newDestination.is_featured || false,
        categories: newDestination.categories || [],
        additional_images: newDestination.additional_images || [],
        activities: newDestination.activities || [],
        amenities: newDestination.amenities || [],
        what_to_bring: newDestination.what_to_bring || [],
        highlights: newDestination.highlights || [],
        additional_costs: newDestination.additional_costs || null
      };
      
      const { data, error } = await supabase
        .from('destinations')
        .insert(destinationWithDefaults)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating destination:", error);
        toast({
          title: "Failed to create destination",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Destination created",
        description: "The destination has been created successfully",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    }
  });

  type UpdateDestinationInput = Partial<CreateDestinationInput> & { id: string };

  const updateDestination = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateDestinationInput) => {
      // Ensure null values are properly handled
      const dataToUpdate = {
        ...updateData,
        description: updateData.description || null,
        image_url: updateData.image_url || null,
        duration_recommended: updateData.duration_recommended || null,
        best_time_to_visit: updateData.best_time_to_visit || null,
        difficulty_level: updateData.difficulty_level || null,
        getting_there: updateData.getting_there || null,
        weather_info: updateData.weather_info || null,
        is_featured: updateData.is_featured || false,
        categories: updateData.categories || [],
        additional_images: updateData.additional_images || [],
        activities: updateData.activities || [],
        amenities: updateData.amenities || [],
        what_to_bring: updateData.what_to_bring || [],
        highlights: updateData.highlights || [],
        additional_costs: updateData.additional_costs || null
      };
      
      const { data, error } = await supabase
        .from('destinations')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating destination:", error);
        toast({
          title: "Failed to update destination",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Destination updated",
        description: "The destination has been updated successfully",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    }
  });

  const deleteDestination = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting destination:", error);
        toast({
          title: "Failed to delete destination",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Destination deleted",
        description: "The destination has been deleted successfully",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    }
  });

  return {
    ...query,
    createDestination,
    updateDestination,
    deleteDestination,
    refetch: query.refetch
  };
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
