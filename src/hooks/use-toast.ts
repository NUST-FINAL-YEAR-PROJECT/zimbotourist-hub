
import * as React from "react"
import { useToast as useToastOriginal, toast as toastOriginal, ToastContext, ToastProps } from "@/components/ui/toast"
import { ToastProvider } from "@/components/ui/toaster"

export const useToast = useToastOriginal
export const toast = toastOriginal
export { ToastProvider, ToastProps }
