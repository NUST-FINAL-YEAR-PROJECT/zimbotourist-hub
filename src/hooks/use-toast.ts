
import { 
  useToast as useToastOriginal, 
  toast as toastOriginal 
} from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toaster";

export const useToast = useToastOriginal;
export const toast = toastOriginal;
export { ToastProvider };
