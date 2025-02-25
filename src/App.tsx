
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { DestinationDetails } from "./pages/DestinationDetails";
import { EventDetails } from "./pages/EventDetails";
import Documentation from "./pages/Documentation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem('redirectAfterAuth', location.pathname);
    }
  }, [loading, user, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    // Get the stored redirect path or default to dashboard
    const redirectPath = sessionStorage.getItem('redirectAfterAuth') || '/dashboard';
    // Clear the stored path
    sessionStorage.removeItem('redirectAfterAuth');
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/documentation" element={<Documentation />} />
      
      {/* Auth route - redirects to dashboard if already authenticated */}
      <Route path="/auth" element={
        <AuthRoute>
          <Auth />
        </AuthRoute>
      } />
      
      {/* Protected routes - require authentication */}
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

      {/* Catch all route - redirect to dashboard if authenticated, otherwise to auth */}
      <Route path="*" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
    </Routes>
  </TooltipProvider>
);

export default App;
