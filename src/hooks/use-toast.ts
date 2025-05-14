
import * as React from "react"
import { 
  useToast as useToastOriginal, 
  toast as toastOriginal, 
  ToastProvider as ToastProviderOriginal,
  type ToastProps, 
  type ToastContextType 
} from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

export const useToast = useToastOriginal
export const toast = toastOriginal
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProviderOriginal>
      {children}
    </ToastProviderOriginal>
  )
}
export type { ToastProps, ToastContextType }
