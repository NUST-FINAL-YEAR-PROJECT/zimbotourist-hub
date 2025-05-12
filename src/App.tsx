
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { DestinationDetails } from "./pages/DestinationDetails";
import { EventDetails } from "./pages/EventDetails";
import Documentation from "./pages/Documentation";
import { Loader2 } from "lucide-react";
import { InitializeData } from "./components/InitializeData";
import { supabase } from "@/integrations/supabase/client";
import { DestinationsPage } from "./pages/DestinationsPage";
import { PaymentStatusPage } from "./pages/PaymentStatusPage";
import { PaymentPage } from "./pages/PaymentPage";

// Rename to SimpleDestinationsPage to avoid conflict with the imported component
const SimpleDestinationsPage = () => (
  <div className="min-h-screen pt-16 pb-12 bg-gray-50">
    <div className="content-container">
      <h1 className="text-3xl font-bold mb-6">Explore All Zimbabwe Destinations</h1>
      <p className="text-lg mb-8 text-muted-foreground">
        Discover the beauty of Zimbabwe's landscapes, wildlife, and cultural heritage.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Destination card {i} - Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EventsPage = () => (
  <div className="min-h-screen pt-16 pb-12 bg-gray-50">
    <div className="content-container">
      <h1 className="text-3xl font-bold mb-6">Upcoming Zimbabwe Events</h1>
      <p className="text-lg mb-8 text-muted-foreground">
        Experience cultural festivals, wildlife tours, and special exhibitions across Zimbabwe.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Event card {i} - Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
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

// Enhanced AdminRoute for robust admin access control
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [verifyingToken, setVerifyingToken] = useState(true);

  // Verify token and permissions
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        setVerifyingToken(true);
        
        // If not logged in, redirect to auth
        if (!loading && !user) {
          console.log("User not logged in, redirecting to auth");
          navigate('/auth?admin=true', { replace: true, state: { from: location } });
          return;
        }
        
        // If loading or no user yet, wait
        if (loading || !user) {
          return;
        }
        
        // Try refreshing the session if needed
        if (user && !session) {
          console.log("User exists but no session, refreshing auth");
          const { data } = await supabase.auth.refreshSession();
          if (data && data.session) {
            console.log("Session refreshed successfully");
          } else {
            console.log("Failed to refresh session, redirecting to auth");
            navigate('/auth?admin=true', { replace: true, state: { from: location } });
            return;
          }
        }
        
        // If logged in but not admin
        if (user && !loading && isAdmin === false) {
          console.log("Access denied: User is not admin");
          toast.error("You don't have permission to access the admin dashboard");
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Error verifying admin access:", error);
        toast.error("Error verifying admin access. Please try logging in again.");
        navigate('/auth?admin=true', { replace: true, state: { from: location } });
      } finally {
        setVerifyingToken(false);
      }
    };
    
    verifyAccess();
  }, [loading, user, isAdmin, navigate, location, session]);

  if (loading || verifyingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?admin=true" replace state={{ from: location }} />;
  }

  // Only render admin content if user is confirmed as admin
  if (isAdmin) {
    return <>{children}</>;
  }

  // Show loading while we're still determining if user is admin
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // When a user is confirmed (not loading), and logged in, redirect appropriately
    if (!loading && user) {
      const redirectPath = isAdmin ? '/admin/dashboard' : '/dashboard';
      // Add a small timeout to ensure states are fully updated
      setTimeout(() => navigate(redirectPath, { replace: true }), 100);
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    // This will be handled by the useEffect, showing loading until redirect happens
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Redirecting to dashboard...</p>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <TooltipProvider>
    <InitializeData />
    <Toaster />
    <Sonner />
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/auth" element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/payment-status" element={
          <ProtectedRoute>
            <PaymentStatusPage />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
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
        <Route path="*" element={
          <Navigate to="/dashboard" replace />
        } />
      </Routes>
    </div>
  </TooltipProvider>
);

export default App;
