
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Layout, LayoutHeader, LayoutContent, LayoutTitle } from "@/components/ui/layout";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Calendar, Settings, Home, BarChart3, Download, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { UserManagement } from "@/components/AdminDashboard/UserManagement";
import { DestinationManager } from "@/components/AdminDashboard/DestinationManager";
import { EventManager } from "@/components/AdminDashboard/EventManager";
import { BookingManager } from "@/components/AdminDashboard/BookingManager";
import { AdminSettings } from "@/components/AdminDashboard/AdminSettings";
import { DashboardStats } from "@/components/AdminDashboard/DashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, adminCheckError } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the profile hook to double-check role
  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = 
    useProfile(user?.id);
  
  // Retry admin check if there's an error
  const retryAdminCheck = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Additional check to ensure admin access
  useEffect(() => {
    if (!loading && !profileLoading) {
      // If profile is loaded and role isn't ADMIN, redirect
      if (profile && profile.role !== 'ADMIN') {
        toast.error("Your profile doesn't have admin privileges");
        navigate("/dashboard");
      }
      
      // If isAdmin is explicitly false and we have profile data
      if (isAdmin === false && profile) {
        toast.error("You don't have permission to access the admin dashboard");
        navigate("/dashboard");
      }
    }
  }, [loading, profileLoading, isAdmin, profile, navigate]);

  // Get current page from path
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes("/users")) return "users";
    if (path.includes("/destinations")) return "destinations";
    if (path.includes("/events")) return "events";
    if (path.includes("/bookings")) return "bookings";
    if (path.includes("/settings")) return "settings";
    if (path.includes("/analytics")) return "analytics";
    return "dashboard";
  };

  const currentPage = getCurrentPage();

  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/admin/dashboard/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Destinations",
      href: "/admin/dashboard/destinations",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Events",
      href: "/admin/dashboard/events",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Bookings",
      href: "/admin/dashboard/bookings",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Analytics & Reports",
      href: "/admin/dashboard/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/admin/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // If still loading, show loading indicator
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  // If there's an error checking admin status, show error with retry option
  if ((adminCheckError || profileError) && retryCount < 3) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
        <p className="text-muted-foreground mb-4">There was an error verifying your admin credentials.</p>
        <div className="max-w-md text-center mb-6">
          <p className="text-sm text-muted-foreground">
            {adminCheckError || profileError?.message || "Failed to verify admin status"}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={retryAdminCheck}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Go to User Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // If max retries reached, show error
  if (retryCount >= 3 && (adminCheckError || profileError)) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Error</h1>
        <p className="text-muted-foreground mb-4">Multiple attempts to verify admin status failed.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to User Dashboard</Button>
      </div>
    );
  }

  // If not admin after all checks, show access denied
  if (!isAdmin && !profile?.role?.includes('ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You do not have permission to access the admin dashboard.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to User Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="hidden md:block border-r bg-background w-64 p-6">
        <div className="flex items-center mb-8">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">A</div>
          <span className="text-xl font-bold ml-2">Admin</span>
        </div>
        <SidebarNav items={sidebarNavItems} />
      </div>

      <Layout>
        <LayoutHeader className="border-b bg-background">
          <div className="flex justify-between items-center">
            <LayoutTitle>
              {currentPage === "dashboard" && "Admin Dashboard"}
              {currentPage === "users" && "User Management"}
              {currentPage === "destinations" && "Destinations Management"}
              {currentPage === "events" && "Events Management"}
              {currentPage === "bookings" && "Bookings Management"}
              {currentPage === "analytics" && "Analytics & Reports"}
              {currentPage === "settings" && "Admin Settings"}
            </LayoutTitle>
            
            <div className="flex items-center gap-4">
              {currentPage === "analytics" && (
                <Button 
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => {
                    // This is just a visual element; the actual export is handled in the DashboardStats component
                    alert("Please use the export buttons in each section to download CSV reports");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export Reports
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Exit Admin
              </Button>
            </div>
          </div>
        </LayoutHeader>

        <LayoutContent className="p-6">
          <Routes>
            <Route path="/" element={<DashboardStats />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/destinations" element={<DestinationManager />} />
            <Route path="/events" element={<EventManager />} />
            <Route path="/bookings" element={<BookingManager />} />
            <Route path="/analytics" element={<DashboardStats />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </LayoutContent>
      </Layout>
    </div>
  );
};

export default AdminDashboard;
