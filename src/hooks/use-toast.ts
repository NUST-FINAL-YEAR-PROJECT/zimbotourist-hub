
import * as React from "react";

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

// Define the toast context types
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToastState = {
  toasts: ToasterToast[];
};

const ToastContext = React.createContext<{
  toasts: ToasterToast[];
  addToast: (toast: ToasterToast) => void;
  removeToast: (toastId?: string) => void;
  removeAll: () => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  removeAll: () => {},
});

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toast: (props: Omit<ToasterToast, "id">) => {
      context.addToast({ ...props, id: Math.random().toString(36).substring(2, 9) });
    },
    dismiss: (toastId?: string) => context.removeToast(toastId),
    dismissAll: () => context.removeAll(),
  };
}

export const toast = (props: Omit<ToasterToast, "id">) => {
  const { toast: addToast } = useToast();
  addToast(props);
};

// Fixed ToastProvider component 
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ToasterToastState>({
    toasts: [],
  });

  const addToast = React.useCallback((toast: ToasterToast) => {
    setState((prevState) => {
      const newToasts = [...prevState.toasts];
      if (newToasts.length >= TOAST_LIMIT) {
        newToasts.shift();
      }
      return {
        ...prevState,
        toasts: [...newToasts, toast],
      };
    });
  }, []);

  const removeToast = React.useCallback((id?: string) => {
    if (id) {
      setState((prevState) => ({
        ...prevState,
        toasts: prevState.toasts.filter((t) => t.id !== id),
      }));
    }
  }, []);

  const removeAll = React.useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      toasts: [],
    }));
  }, []);

  const value = React.useMemo(
    () => ({
      toasts: state.toasts,
      addToast,
      removeToast,
      removeAll,
    }),
    [state.toasts, addToast, removeToast, removeAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export { ToastProvider };
