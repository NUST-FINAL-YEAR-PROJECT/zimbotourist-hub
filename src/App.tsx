
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { DestinationDetails } from "./pages/DestinationDetails";
import { EventDetails } from "./pages/EventDetails";
import { AccommodationDetails } from "./pages/AccommodationDetails";
import Documentation from "./pages/Documentation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { InitializeData } from "./components/InitializeData";

// Create placeholder pages for routes we added in the navbar
const DestinationsPage = () => (
  <div className="min-h-screen pt-20 pb-12 bg-gray-50">
    <div className="content-container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Explore All Destinations</h1>
      <p className="text-lg mb-12 text-muted-foreground">
        This page will show all destinations. Coming soon!
      </p>
    </div>
  </div>
);

const AccommodationsPage = () => (
  <div className="min-h-screen pt-20 pb-12 bg-gray-50">
    <div className="content-container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">All Accommodations</h1>
      <p className="text-lg mb-12 text-muted-foreground">
        This page will show all accommodations. Coming soon!
      </p>
    </div>
  </div>
);

const EventsPage = () => (
  <div className="min-h-screen pt-20 pb-12 bg-gray-50">
    <div className="content-container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>
      <p className="text-lg mb-12 text-muted-foreground">
        This page will show all events. Coming soon!
      </p>
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
    const redirectPath = sessionStorage.getItem('redirectAfterAuth') || '/dashboard';
    sessionStorage.removeItem('redirectAfterAuth');
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="ui-theme">
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
          <Route path="/accommodations" element={<AccommodationsPage />} />
          <Route path="/events" element={<EventsPage />} />
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
          <Route
            path="/accommodation/:id"
            element={
              <ProtectedRoute>
                <AccommodationDetails />
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
  </ThemeProvider>
);

export default App;
