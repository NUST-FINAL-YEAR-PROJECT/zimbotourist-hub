
// Utility functions for toast-related operations
import { toast as sonnerToast } from "sonner";
import { toast as shadcnToast } from "@/hooks/use-toast";

// Use sonner toast as default toast mechanism throughout the app
export const toast = sonnerToast;

// Function to handle errors with standardized toast messages
export const handleApiError = (error: unknown, customMessage?: string): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("API Error:", errorMessage);
  toast.error(customMessage || "An error occurred", {
    description: errorMessage.slice(0, 100)
  });
};

// Function to handle success with standardized toast messages
export const handleApiSuccess = (message: string, description?: string): void => {
  toast.success(message, {
    description
  });
};
