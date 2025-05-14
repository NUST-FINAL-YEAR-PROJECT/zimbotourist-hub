
import * as React from "react";
import { 
  ToastProvider as ToastProviderOriginal,
  type ToastProps, 
  type ToastContextType,
  ToastContext,
  useToast as useToastOriginal,
  toast as toastOriginal
} from "@/components/ui/toast";

// Re-export the toast provider with children
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProviderOriginal>
      {children}
    </ToastProviderOriginal>
  );
};

// Hook to access toast context - use the original hook directly
export const useToast = useToastOriginal;

// Toast function shorthand - use the original toast function directly
export const toast = toastOriginal;

export type { ToastProps, ToastContextType };
