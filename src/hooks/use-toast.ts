
// Fixed ToastProvider component 
function ToastProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export { useToast, toast, ToastProvider };
