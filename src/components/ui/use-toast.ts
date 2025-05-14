
// Re-export from the hooks directory
import { useToast, toast, ToastProvider } from "@/hooks/use-toast";
import type { ToastProps, ToastContextType } from "@/components/ui/toast";

export { useToast, toast, ToastProvider };
export type { ToastProps, ToastContextType };
