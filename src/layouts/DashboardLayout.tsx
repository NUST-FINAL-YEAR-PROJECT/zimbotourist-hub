
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
