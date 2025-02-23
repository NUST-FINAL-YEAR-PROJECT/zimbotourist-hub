
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
