
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Event } from "@/types/models";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_date", { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          toast.error("Failed to fetch events");
          throw error;
        }

        if (!data) {
          toast.error("No events found");
          return [];
        }

        return data as Event[];
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch events");
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useEvent = (id: string | undefined) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Event not found");
      }

      return data as Event;
    },
    enabled: !!id,
  });
};

export const useUpdateEventProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      eventId,
      programUrl,
      programName,
      programType,
    }: {
      eventId: string;
      programUrl: string;
      programName: string;
      programType: string;
    }) => {
      const { data, error } = await supabase
        .from("events")
        .update({
          program_url: programUrl,
          program_name: programName,
          program_type: programType,
        })
        .eq("id", eventId)
        .select()
        .single();

      if (error) {
        console.error("Error updating event program:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      toast.success("Event program updated successfully");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to update event program");
    },
  });
};

export const useUpcomingEvents = (limit: number = 3) => {
  return useQuery({
    queryKey: ["upcomingEvents", limit],
    queryFn: async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .gte("start_date", now)
          .order("start_date", { ascending: true })
          .limit(limit);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        return data as Event[];
      } catch (error) {
        console.error("Fetch error for upcoming events:", error);
        throw error;
      }
    },
  });
};
