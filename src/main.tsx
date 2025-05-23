
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ToastProvider } from "@/components/ui/toaster"; // Import ToastProvider from the correct location
import { Toaster } from "@/components/ui/sonner";
import App from './App.tsx';
import './index.css';

// Initialize window.env if it doesn't exist
window.env = window.env || {};

// Add VITE_SUPABASE_FUNCTIONS_URL to window.env for use in components
if (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL) {
  window.env.VITE_SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
}

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <ToastProvider>
          <App />
          <Toaster position="top-right" />
        </ToastProvider>
      </SidebarProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
