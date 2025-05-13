
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TopNavbar } from "@/components/TopNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { DestinationsPage } from "@/pages/DestinationsPage";
import { DestinationDetails } from "@/pages/DestinationDetails";
import { MyBookings } from "@/pages/MyBookings";
import { InitializeData } from "@/components/InitializeData";
import { PaymentPage } from "@/pages/PaymentPage";
import { PaymentStatusPage } from "@/pages/PaymentStatusPage";
import { EventDetails } from "@/pages/EventDetails";
import Documentation from "@/pages/Documentation";
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
  const showNavbar = !location.pathname.startsWith("/auth") && 
                     !location.pathname.startsWith("/dashboard") && 
                     !location.pathname.startsWith("/admin");
  
  return (
    <TooltipProvider>
      <SidebarProvider>
        <InitializeData />
        <Toaster position="top-right" />
        <div className="app-container">
          {showNavbar && <TopNavbar />}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destination/:id" element={<DestinationDetails />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/payment-status" element={<PaymentStatusPage />} />
            
            {/* Protected dashboard routes */}
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/destinations" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/events" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/payment" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/standalone-payment" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default App;
