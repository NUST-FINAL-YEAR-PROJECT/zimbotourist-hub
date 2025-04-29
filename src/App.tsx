import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { DestinationDetails } from "./pages/DestinationDetails";
import { EventDetails } from "./pages/EventDetails";
import Documentation from "./pages/Documentation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { InitializeData } from "./components/InitializeData";
import { supabase } from "@/integrations/supabase/client";
import { DestinationsPage } from "./pages/DestinationsPage";
import { PaymentStatusPage } from "./pages/PaymentStatusPage";

// Rename to SimpleDestinationsPage to avoid conflict with the imported component
const SimpleDestinationsPage = () => (
  <div className="min-h-screen pt-16 pb-12 bg-gray-50">
    <div className="content-container">
      <h1 className="text-3xl font-bold mb-6">Explore All Destinations</h1>
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
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
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
  const { user, loading, showSplash } = useAuth();
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

  if (showSplash) {
    // Don't redirect, let the splash screen handle it
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, showSplash, loginAsAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for bypass parameter in URL - this makes it easier to access the admin dashboard
  const searchParams = new URLSearchParams(location.search);
  const bypassAuth = searchParams.get("bypass") === "true";
  
  useEffect(() => {
    // If bypass is true, log in as admin automatically
    if (bypassAuth && !user) {
      console.log("Bypassing auth and logging in as admin automatically");
      loginAsAdmin();
    } else if (!bypassAuth && user) {
      const verifyAdminAccess = async () => {
        if (user) {
          console.log("AdminRoute - Verifying admin access for user:", user.id);
          console.log("AdminRoute - Current isAdmin state:", isAdmin);
          
          // Double-check admin status directly from database
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Admin verification error:', error);
          } else {
            const hasAdminRole = data?.role === 'ADMIN';
            console.log("AdminRoute - Database admin check result:", hasAdminRole);
            console.log("AdminRoute - Profile data:", data);
            
            if (!hasAdminRole) {
              console.log("AdminRoute - User is not admin, redirecting to dashboard");
              // This is a backup redirect if isAdmin state is wrong
              if (!showSplash) {
                navigate('/dashboard');
              }
            }
          }
        }
      };
      
      if (!loading && !showSplash) {
        verifyAdminAccess();
      }
    }
  }, [user, loading, showSplash, isAdmin, navigate, bypassAuth, loginAsAdmin]);

  if (bypassAuth) {
    // When bypass is true, show a loading state while loginAsAdmin is processing
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Accessing admin dashboard...</p>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showSplash) {
    // Don't redirect, let the splash screen handle it
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/auth?admin=true" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, showSplash } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showSplash) {
    // Don't redirect, let the splash screen handle it
    return <>{children}</>;
  }

  if (user) {
    const redirectPath = sessionStorage.getItem('redirectAfterAuth') || '/dashboard';
    sessionStorage.removeItem('redirectAfterAuth');
    return <Navigate to={redirectPath} replace />;
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
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  </TooltipProvider>
);

export default App;
