
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { AppNotification } from "@/types/models";
import { toast } from "sonner"; // Standardize on sonner for toast notifications

export const useNotifications = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AppNotification[];
    },
    enabled: !!userId,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      // Explicitly invalidate the notifications query after marking all as read
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as AppNotification;
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          
          // Display toast notification using sonner
          const type = newNotification.type as "success" | "error" | "warning" | "default";
          toast[type]?.(newNotification.title, {
            description: newNotification.description
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.is_read).length,
  };
};
