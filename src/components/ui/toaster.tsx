
import * as React from "react"
import { 
  useToast, 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastTitle, 
  ToastViewport, 
  type ToastProps,
  type ToastContextType,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </>
  )
}

// Create and export a functional ToastProvider
export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: ToastProps) => {
    setToasts((prev) => [...prev, { ...toast, id: toast.id || crypto.randomUUID() }])
  }, [])

  const updateToast = React.useCallback((id: string, toast: Partial<ToastProps>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...toast } : t)))
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)))
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  
  // Create the toast helper function
  const toast = React.useCallback((props: ToastProps) => {
    addToast(props)
  }, [addToast])

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    updateToast,
    dismissToast,
    removeToast,
    toast,
  }

  return (
    <React.Fragment>
      {children}
      <Toaster />
    </React.Fragment>
  )
}
