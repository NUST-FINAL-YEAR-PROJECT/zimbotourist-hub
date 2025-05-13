
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
      setToasts((prevToasts) => [...prevToasts, { ...props, id: props.id || Math.random().toString() }]);
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

// Creating a callable toast function
const toastFunction = (props: ToastProps) => {
  // Get the context directly
  const context = useContext(ToastContext);
  
  if (context) {
    context.toast(props);
  } else {
    console.warn("Toast was called outside of ToastProvider context");
  }
};

// Adding helper methods
toastFunction.error = (message: string) => {
  toastFunction({ title: "Error", description: message, variant: "destructive" });
};

toastFunction.success = (message: string) => {
  toastFunction({ title: "Success", description: message, variant: "success" });
};

toastFunction.warning = (message: string) => {
  toastFunction({ title: "Warning", description: message, variant: "warning" });
};

toastFunction.info = (message: string) => {
  toastFunction({ title: "Info", description: message, variant: "info" });
};

export const toast = toastFunction;
