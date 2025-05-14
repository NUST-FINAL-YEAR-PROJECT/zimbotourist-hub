
import * as React from "react";
import { 
  ToastProvider as ToastProviderOriginal, 
  ToastContext,
  type ToastProps, 
  type ToastContextType 
} from "@/components/ui/toast";

// Re-export the toast provider with children
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProviderOriginal>
      {children}
    </ToastProviderOriginal>
  );
};

// Hook to access toast context
export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
};

// Toast function shorthand
export const toast = (props: ToastProps) => {
  const { addToast } = useToast();
  addToast(props);
};

export type { ToastProps, ToastContextType };
