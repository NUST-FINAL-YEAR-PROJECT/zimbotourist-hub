import React, { useState } from "react";
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
  BarChart3,
  Ticket,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfile } from "@/hooks/useProfile";
import { useDestinations } from "@/hooks/useDestinations";
import { useEvents } from "@/hooks/useEvents";
import { useUsers } from "@/hooks/useUsers";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: destinations, isLoading: destinationsLoading } = useDestinations();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success("Successfully signed out from admin dashboard");
  };

  const handleRefreshUsers = () => {
    refetchUsers();
    toast.success("Refreshing users data...");
  };

  // Placeholder data for demonstration
  const bookingsData = [
    { id: "1", user: "john@example.com", destination: "Victoria Falls", date: "2025-05-20", status: "Confirmed", amount: "$250" },
    { id: "2", email: "sarah@example.com", destination: "Great Zimbabwe", date: "2025-06-12", status: "Pending", amount: "$180" },
    { id: "3", email: "mike@example.com", event: "Wildlife Safari", date: "2025-04-30", status: "Cancelled", amount: "$320" },
  ];

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
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-white p-1 border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="destinations" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <Map className="h-4 w-4 mr-2" />
              Destinations
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <Ticket className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          {/* Dashboard Overview Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Dashboard Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-amber-500" />
                Dashboard Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Total Users</h3>
                  <p className="text-3xl font-bold text-amber-500">{users?.length || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">Updated just now</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Active Destinations</h3>
                  <p className="text-3xl font-bold text-amber-500">{destinations?.length || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">Total destinations</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Total Events</h3>
                  <p className="text-3xl font-bold text-amber-500">{events?.length || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">Upcoming events</p>
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
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="h-6 w-6 text-amber-500" />
                  <span>Manage Users</span>
                </Button>
                
                <Button 
                  className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                  onClick={() => setActiveTab("destinations")}
                >
                  <Map className="h-6 w-6 text-amber-500" />
                  <span>Manage Destinations</span>
                </Button>
                
                <Button 
                  className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                  onClick={() => setActiveTab("events")}
                >
                  <Calendar className="h-6 w-6 text-amber-500" />
                  <span>Manage Events</span>
                </Button>
                
                <Button 
                  className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                  onClick={() => setActiveTab("settings")}
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
                  onClick={handleRefreshUsers}
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
          </TabsContent>
          
          {/* Users Management Tab */}
          <TabsContent value="users">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Users className="h-6 w-6 mr-2 text-amber-500" />
                  User Management
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  <Button 
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    Add User
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleRefreshUsers}
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
              
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading users data...</p>
                </div>
              ) : !users || users.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                  <p className="text-gray-500 mb-4">There are no users registered in the system.</p>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Add First User
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of all registered users</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>{user.username || "N/A"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role || "USER"}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="mr-2">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
          
          {/* Destinations Management Tab */}
          <TabsContent value="destinations">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Map className="h-6 w-6 mr-2 text-amber-500" />
                  Destinations Management
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search destinations..." 
                      className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Add Destination
                  </Button>
                </div>
              </div>
              
              {destinationsLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading destinations data...</p>
                </div>
              ) : !destinations || destinations.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Destinations Found</h3>
                  <p className="text-gray-500 mb-4">There are no destinations available in the system.</p>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Add First Destination
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of all destinations</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.map(destination => (
                      <TableRow key={destination.id}>
                        <TableCell className="font-medium">{destination.id.substring(0, 8)}...</TableCell>
                        <TableCell>{destination.name}</TableCell>
                        <TableCell>{destination.location}</TableCell>
                        <TableCell>${destination.price}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${destination.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {destination.is_featured ? 'Featured' : 'Regular'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="mr-2">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
          
          {/* Events Management Tab */}
          <TabsContent value="events">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-amber-500" />
                  Events Management
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search events..." 
                      className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Add Event
                  </Button>
                </div>
              </div>
              
              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading events data...</p>
                </div>
              ) : !events || events.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Events Found</h3>
                  <p className="text-gray-500 mb-4">There are no events available in the system.</p>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Add First Event
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of all events</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.id.substring(0, 8)}...</TableCell>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{new Date(event.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>${event.price}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="mr-2">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
          
          {/* Bookings Management Tab */}
          <TabsContent value="bookings">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Ticket className="h-6 w-6 mr-2 text-amber-500" />
                  Bookings Management
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search bookings..." 
                      className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Create Booking
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableCaption>A list of all bookings</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Destination/Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsData.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{booking.user}</TableCell>
                      <TableCell>{booking.destination || booking.event}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell>{booking.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">
                          View
                        </Button>
                        <Button variant="destructive" size="sm">
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-amber-500" />
                System Settings
              </h2>
              
              <div className="space-y-8">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-medium mb-3">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">System Name</label>
                      <input 
                        type="text" 
                        defaultValue="Reserve.zw" 
                        className="w-full md:w-1/2 px-4 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Contact Email</label>
                      <input 
                        type="email" 
                        defaultValue="admin@reserve.zw" 
                        className="w-full md:w-1/2 px-4 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Default Currency</label>
                      <select className="w-full md:w-1/2 px-4 py-2 border rounded-md">
                        <option>USD ($)</option>
                        <option>ZWL (Z$)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border-b pb-6">
                  <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between w-full md:w-1/2">
                      <span className="text-sm">Send booking confirmation emails</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between w-full md:w-1/2">
                      <span className="text-sm">Send payment confirmation emails</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between w-full md:w-1/2">
                      <span className="text-sm">Send booking reminder emails</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between w-full md:w-1/2">
                      <span className="text-sm">Send marketing emails</span>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Danger Zone</h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="font-medium text-red-700">Reset System</h4>
                    <p className="text-sm text-red-600 mb-3">This action will reset all system data. This cannot be undone.</p>
                    <Button variant="destructive" size="sm">
                      Reset System
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-amber-500 hover:bg-amber-600">Save Settings</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
