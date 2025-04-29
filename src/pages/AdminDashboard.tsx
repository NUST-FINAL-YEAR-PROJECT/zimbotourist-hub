
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Users, 
  Map, 
  Calendar, 
  Home, 
  Settings, 
  LogOut, 
  RefreshCcw, 
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success("Successfully signed out from admin dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-amber-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6" />
            <h1 className="text-xl font-bold">Administrator Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-amber-400" 
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              View Site
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="bg-amber-400 hover:bg-amber-300 text-white border-amber-400 hover:border-amber-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Dashboard Overview */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-amber-500" />
              Dashboard Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Total Users</h3>
                <p className="text-3xl font-bold text-amber-500">1,234</p>
                <p className="text-sm text-gray-500 mt-2">+12% from last month</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Active Destinations</h3>
                <p className="text-3xl font-bold text-amber-500">78</p>
                <p className="text-sm text-gray-500 mt-2">+3 new this month</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Total Bookings</h3>
                <p className="text-3xl font-bold text-amber-500">582</p>
                <p className="text-sm text-gray-500 mt-2">+28% from last month</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Revenue</h3>
                <p className="text-3xl font-bold text-amber-500">$24,582</p>
                <p className="text-sm text-gray-500 mt-2">+15% from last month</p>
              </div>
            </div>
          </section>
          
          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button 
                className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                onClick={() => toast.info("User management coming soon")}
              >
                <Users className="h-6 w-6 text-amber-500" />
                <span>Manage Users</span>
              </Button>
              
              <Button 
                className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                onClick={() => toast.info("Destination management coming soon")}
              >
                <Map className="h-6 w-6 text-amber-500" />
                <span>Manage Destinations</span>
              </Button>
              
              <Button 
                className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                onClick={() => toast.info("Event management coming soon")}
              >
                <Calendar className="h-6 w-6 text-amber-500" />
                <span>Manage Events</span>
              </Button>
              
              <Button 
                className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                onClick={() => toast.info("Settings coming soon")}
              >
                <Settings className="h-6 w-6 text-amber-500" />
                <span>System Settings</span>
              </Button>
            </div>
          </section>
          
          {/* Recent Activity */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-amber-500 text-amber-600"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <p className="text-center text-gray-500">Activity feed will be shown here</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
