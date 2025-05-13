
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TopNavbar } from "@/components/TopNavbar";
import { AppSidebar } from "@/components/AppSidebar";

// Pages
import { Index } from "@/pages/Index";
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { DestinationsPage } from "@/pages/DestinationsPage";
import { DestinationDetails } from "@/pages/DestinationDetails";
import { MyBookings } from "@/pages/MyBookings";
import { InitializeData } from "@/components/InitializeData";
import { PaymentPage } from "@/pages/PaymentPage";
import { PaymentStatusPage } from "@/pages/PaymentStatusPage";
import { EventDetails } from "@/pages/EventDetails";
import { Documentation } from "@/pages/Documentation";
import { StandalonePaymentPage } from "@/pages/StandalonePaymentPage";

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

// Layout with sidebar for dashboard routes
const DashboardLayout = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// Admin route component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main app component
function App() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith("/auth");
  
  return (
    <TooltipProvider>
      <InitializeData />
      <Toaster />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destination/:id" element={<DestinationDetails />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute><DashboardLayout><MyBookings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/payment" element={<ProtectedRoute><DashboardLayout><PaymentPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/standalone-payment" element={<ProtectedRoute><DashboardLayout><StandalonePaymentPage /></DashboardLayout></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminRoute><DashboardLayout><AdminDashboard /></DashboardLayout></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </TooltipProvider>
  );
}

export default App;
