
import * as React from "react"
import { 
  useToast as useToastOriginal, 
  toast as toastOriginal, 
  ToastContext, 
  type ToastProps, 
  type ToastContextType 
} from "@/components/ui/toast"
import { ToastProvider } from "@/components/ui/toaster"

export const useToast = useToastOriginal
export const toast = toastOriginal
export { ToastProvider }
export type { ToastProps, ToastContextType } // Correctly re-export types with 'export type'
