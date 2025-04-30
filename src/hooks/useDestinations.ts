
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

  const createDestination = useMutation({
    mutationFn: async (newDestination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>) => {
      // Ensure additional_costs is set to null if not provided
      const destinationWithDefaults = {
        ...newDestination,
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

  const updateDestination = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Destination> & { id: string }) => {
      // Ensure additional_costs is properly handled
      const dataToUpdate = {
        ...updateData,
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
