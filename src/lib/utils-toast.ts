
// Utility functions for toast-related operations
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/components/ui/toast";

// Export the useToast hook from toast component
export { useToast };

// Function to handle errors with standardized toast messages
export const handleApiError = (error: unknown, customMessage?: string): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("API Error:", errorMessage);
  sonnerToast.error(customMessage || "An error occurred", {
    description: errorMessage.slice(0, 100)
  });
};

// Function to handle success with standardized toast messages
export const handleApiSuccess = (message: string, description?: string): void => {
  sonnerToast.success(message, {
    description
  });
};
