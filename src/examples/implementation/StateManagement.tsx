
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Example of state management using React Query
 * - Custom hook for fetching destinations
 * - Filtering mechanism
 * - Error handling
 */

export interface DestinationFilters {
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

export const useDestinations = (filters?: DestinationFilters) => {
  return useQuery({
    queryKey: ['destinations', filters],
    queryFn: async () => {
      let query = supabase.from('destinations').select('*');
      
      if (filters?.region) {
        query = query.eq('region', filters.region);
      }
      
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.category) {
        query = query.contains('categories', [filters.category]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSaveDestination = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (destination: any) => {
      const { data, error } = await supabase
        .from('destinations')
        .upsert(destination)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      toast.success('Destination saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save destination: ${error.message}`);
    },
  });
};

// Example component showing hook usage
export const DestinationsList = ({ filters }: { filters?: DestinationFilters }) => {
  const { data: destinations, isLoading, error } = useDestinations(filters);
  
  if (isLoading) return <div>Loading destinations...</div>;
  if (error) return <div>Error loading destinations: {(error as Error).message}</div>;
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Destinations ({destinations?.length || 0})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations?.map(destination => (
          <div key={destination.id} className="border rounded-lg p-4">
            <h3>{destination.name}</h3>
            <p>${destination.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
