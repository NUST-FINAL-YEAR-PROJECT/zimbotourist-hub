import * as React from "react";
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useToast as useToastUI } from "@/components/ui/use-toast";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

export const toastReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        };
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({
          ...t,
          open: false,
        })),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

function dispatchToast(props: ToasterToast) {
  const { toast } = useToast();
  toast(props);
}

export function useToast() {
  const { toast } = useToastUI();
  
  return {
    toast,
    error: (description: string, title: string = "Error") => {
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
    success: (description: string, title: string = "Success") => {
      toast({
        variant: "success",
        title,
        description,
      });
    },
    warning: (description: string, title: string = "Warning") => {
      toast({
        variant: "warning",
        title,
        description,
      });
    },
    info: (description: string, title: string = "Info") => {
      toast({
        title,
        description,
      });
    },
  };
}

// Create a function-based toast API for direct imports
function toastFunction(props: ToastProps) {
  const id = generateId();
  const { toast } = useToastUI();
  toast({ ...props, id });
}

// Add variant methods as properties to the main function
toastFunction.error = (description: string, title: string = "Error") => {
  const { toast } = useToastUI();
  toast({
    variant: "destructive",
    title,
    description,
  });
};

toastFunction.success = (description: string, title: string = "Success") => {
  const { toast } = useToastUI();
  toast({
    variant: "success",
    title,
    description,
  });
};

toastFunction.warning = (description: string, title: string = "Warning") => {
  const { toast } = useToastUI();
  toast({
    variant: "warning",
    title,
    description,
  });
};

toastFunction.info = (description: string, title: string = "Info") => {
  const { toast } = useToastUI();
  toast({
    title,
    description,
  });
};

// Export the function with added properties
export const toast = toastFunction;

// Fix the ToastProvider component definition
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
