
import * as React from "react";
import { createContext, useContext } from "react";

import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

type ToastContextType = {
  toast: (props: ToastProps) => void;
  dismiss: (toastId?: string) => void;
  toasts: ToastProps[];
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Use a non-JSX implementation for the provider
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback(
    (props: ToastProps) => {
      setToasts((prevToasts) => [...prevToasts, { ...props, id: Math.random().toString() }]);
    },
    []
  );

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prevToasts) =>
      prevToasts.filter((toast) => (toastId ? toast.id !== toastId : true))
    );
  }, []);

  // Create the context value
  const contextValue = {
    toast,
    dismiss,
    toasts
  };

  // Use React.createElement instead of JSX
  return React.createElement(
    ToastContext.Provider,
    { value: contextValue },
    children
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

export const toast = {
  error: (message: string) => {
    console.error(message); // For debugging purposes
    // In production, we would use a toast library here
    // For now, we'll just log to console
  },
  success: (message: string) => {
    console.log("Success:", message); // For debugging purposes
  },
  warning: (message: string) => {
    console.warn(message); // For debugging purposes
  },
  info: (message: string) => {
    console.info(message); // For debugging purposes
  },
};
