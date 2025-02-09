
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { DestinationDetails } from "./pages/DestinationDetails";
import { EventDetails } from "./pages/EventDetails";
import Documentation from "./pages/Documentation";
import type { User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session and handle refresh token errors
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          toast.error("Session expired. Please login again.");
          // Clear any stale session data
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("An error occurred checking your session");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token has been refreshed');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/destination/:id"
            element={
              <ProtectedRoute>
                <DestinationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
