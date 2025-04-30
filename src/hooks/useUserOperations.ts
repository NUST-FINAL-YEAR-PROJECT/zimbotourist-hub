
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
      // Create a new user through profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
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

  return {
    isLoading,
    createUser,
    updateUser,
    deleteUser,
  };
};
