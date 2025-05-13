
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Event } from "@/types/models";

export const useEventOperations = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all events
  const { data: events, isLoading: isFetchingEvents, error } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_date", { ascending: false });

        if (error) {
          toast.error("Failed to fetch events");
          throw error;
        }

        return data as unknown as Event[];
      } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
    },
  });

  // Create event mutation
  const createEvent = useMutation({
    mutationFn: async (newEvent: Partial<Event> & { title: string }) => {
      setIsLoading(true);
      try {
        // Convert Date objects to ISO strings if they exist
        const eventData = {
          ...newEvent,
          start_date: newEvent.start_date ? 
            (typeof newEvent.start_date === 'object' ? (newEvent.start_date as Date).toISOString() : newEvent.start_date) 
            : null,
          end_date: newEvent.end_date ? 
            (typeof newEvent.end_date === 'object' ? (newEvent.end_date as Date).toISOString() : newEvent.end_date)
            : null,
        };

        const { data, error } = await supabase
          .from("events")
          .insert(eventData)
          .select()
          .single();

        if (error) {
          toast.error(`Failed to create event: ${error.message}`);
          throw error;
        }

        toast.success("Event created successfully");
        return data as unknown as Event;
      } catch (error) {
        console.error("Error creating event:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  // Update event mutation
  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Event> }) => {
      setIsLoading(true);
      try {
        // Convert Date objects to ISO strings if they exist
        const eventData = {
          ...data,
          start_date: data.start_date ? 
            (typeof data.start_date === 'object' ? (data.start_date as Date).toISOString() : data.start_date)
            : null,
          end_date: data.end_date ? 
            (typeof data.end_date === 'object' ? (data.end_date as Date).toISOString() : data.end_date)
            : null,
        };

        const { data: updatedEvent, error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          toast.error(`Failed to update event: ${error.message}`);
          throw error;
        }

        toast.success("Event updated successfully");
        return updatedEvent as unknown as Event;
      } catch (error) {
        console.error("Error updating event:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });

  // Delete event mutation
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      try {
        const { error } = await supabase.from("events").delete().eq("id", id);

        if (error) {
          toast.error(`Failed to delete event: ${error.message}`);
          throw error;
        }

        toast.success("Event deleted successfully");
        return id;
      } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    events,
    isFetchingEvents,
    error,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
