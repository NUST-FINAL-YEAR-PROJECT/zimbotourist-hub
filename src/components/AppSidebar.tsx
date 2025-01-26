import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Settings, Ticket, User, Home, Calendar } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
      return;
    }
    navigate("/auth");
  };

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      onClick: () => navigate("/dashboard"),
    },
    {
      title: "Profile",
      icon: User,
      onClick: () => navigate("/dashboard/profile"),
    },
    {
      title: "My Bookings",
      icon: Ticket,
      onClick: () => navigate("/dashboard/bookings"),
    },
    {
      title: "Destinations",
      icon: MapPin,
      onClick: () => navigate("/dashboard/destinations"),
    },
    {
      title: "Events",
      icon: Calendar,
      onClick: () => navigate("/dashboard/events"),
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => navigate("/dashboard/settings"),
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Tourism App</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}