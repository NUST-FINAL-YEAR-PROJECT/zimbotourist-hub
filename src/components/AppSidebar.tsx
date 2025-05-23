
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Settings, Ticket, Home, Calendar, Sparkles, Bell, AlertCircle, Info, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useIsMobile";

export function AppSidebar() {
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      title: "My Bookings",
      icon: Ticket,
      onClick: () => navigate("/dashboard/bookings"),
      path: "/dashboard/bookings",
    },
    {
      title: "Destinations",
      icon: MapPin,
      onClick: () => navigate("/dashboard/destinations"),
      path: "/dashboard/destinations",
    },
    {
      title: "Events",
      icon: Calendar,
      onClick: () => navigate("/dashboard/events"),
      path: "/dashboard/events",
    },
  ];
  
  if (isMobile) {
    return (
      <div className="mobile-nav-bottom">
        <div className="flex justify-around items-center">
          {menuItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center py-1 px-2 h-auto",
                window.location.pathname === item.path ? "text-blue-600" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.title}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Sidebar className="bg-white border-r border-gray-100 shadow-sm">
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className={cn(
              "text-lg font-display font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent transition-opacity duration-300",
              state === "collapsed" && "opacity-0"
            )}>
              Reserve.zw
            </h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={item.onClick}
                      className="hover:bg-blue-50 hover:text-blue-600 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-600"
                      isActive={window.location.pathname === item.path}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 5 * 0.05, duration: 0.3 }}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/dashboard/settings")}
                    className="hover:bg-blue-50 hover:text-blue-600 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-600"
                    isActive={window.location.pathname === "/dashboard/settings"}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>
              
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 6 * 0.05, duration: 0.3 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin/dashboard")}
                      className="hover:bg-amber-50 hover:text-amber-600 data-[active=true]:bg-amber-100 data-[active=true]:text-amber-600"
                      isActive={window.location.pathname.startsWith("/admin/dashboard")}
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span className="font-medium">Admin Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-100 p-4 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
