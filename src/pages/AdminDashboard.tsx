
import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Layout, LayoutHeader, LayoutContent, LayoutTitle } from "@/components/ui/layout";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Calendar, Settings, Home, BarChart3, Download } from "lucide-react";
import { UserManagement } from "@/components/AdminDashboard/UserManagement";
import { DestinationManager } from "@/components/AdminDashboard/DestinationManager";
import { EventManager } from "@/components/AdminDashboard/EventManager";
import { BookingManager } from "@/components/AdminDashboard/BookingManager";
import { AdminSettings } from "@/components/AdminDashboard/AdminSettings";
import { DashboardStats } from "@/components/AdminDashboard/DashboardStats";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
