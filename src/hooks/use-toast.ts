
import * as React from "react";
import { createContext, useContext } from "react";

import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

type ToastContextType = {
  toast: (props: ToastProps) => void;
  dismiss: (toastId?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

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

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
    </ToastContext.Provider>
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
