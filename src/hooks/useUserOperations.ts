import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';

export type UserFormData = {
  email: string;
  username: string;
  role: string;
};

export const useUserOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createUser = async (userData: UserFormData) => {
    setIsLoading(true);
    try {
      // Generate a UUID for the new user
      const userId = uuidv4();
      
      // Create a new user through profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId, // Add the required id field
          email: userData.email,
          username: userData.username,
          role: userData.role,
        })
        .select();

      if (profileError) {
        toast.error(`Failed to create user: ${profileError.message}`);
        return null;
      }

      toast.success("User created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return profileData[0];
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<UserFormData>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          username: userData.username,
          role: userData.role,
        })
        .eq("id", userId)
        .select();

      if (error) {
        toast.error(`Failed to update user: ${error.message}`);
        return null;
      }

      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return data[0];
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        toast.error(`Failed to delete user: ${error.message}`);
        return false;
      }

      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return true;
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // New functions for locking and unlocking users
  const lockUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_locked: true })
        .eq("id", userId)
        .select();

      if (error) {
        toast.error(`Failed to lock user: ${error.message}`);
        return false;
      }

      toast.success("User has been locked successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return true;
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unlockUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_locked: false })
        .eq("id", userId)
        .select();

      if (error) {
        toast.error(`Failed to unlock user: ${error.message}`);
        return false;
      }

      toast.success("User has been unlocked successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return true;
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // New function to promote current user to admin
  const promoteToAdmin = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("No authenticated user found");
        return false;
      }
      
      // Update profile to ADMIN role
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "ADMIN" })
        .eq("id", user.id)
        .select();

      if (error) {
        toast.error(`Failed to promote user to admin: ${error.message}`);
        return false;
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      toast.success("You've been promoted to Administrator!");
      return true;
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    lockUser,
    unlockUser,
    promoteToAdmin
  };
};
