
import { useState } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line } from "recharts";
import { Loader2, Activity, Users, MapPin, Calendar, AlertTriangle, DollarSign, FileDown, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon } from "lucide-react";

export const DashboardStats = () => {
  const [confirmedOnly, setConfirmedOnly] = useState(true);
  const { data: stats, isLoading, error } = useDashboardStats(confirmedOnly);

  // Function to export data as CSV
  const exportToCSV = (data: any[], filename: string) => {
    // Convert data to CSV format
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // Append, click and remove link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error Loading Dashboard Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            There was a problem loading the dashboard statistics. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overviewCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Destinations",
      value: stats?.totalDestinations || 0,
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Events",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-100"
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600", 
      bgColor: "bg-green-100"
    }
  ];

  const bookingStatusData = stats?.bookingsByStatus || [];
  const popularDestinationsData = stats?.popularDestinations || [];
  const monthlyRevenueData = stats?.monthlyRevenue || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      {/* Data Filter Control */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
          <CardDescription>
            Comprehensive analytics and reporting for regulatory compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="confirmedOnly" 
                checked={confirmedOnly}
                onCheckedChange={setConfirmedOnly}
              />
              <Label htmlFor="confirmedOnly">
                Show only confirmed bookings in analytics
              </Label>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(stats?.recentBookings || [], 'bookings-report')}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Export Bookings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(
                  stats?.monthlyRevenue.map(m => ({ month: m.month, revenue: m.revenue })) || [], 
                  'revenue-report'
                )}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Export Revenue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bgColor} p-2 rounded-full`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.title === "Total Revenue" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {confirmedOnly ? 'From confirmed bookings only' : 'From all bookings'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <PieChartIcon className="h-4 w-4" />
            Booking Status
          </TabsTrigger>
          <TabsTrigger value="destinations" className="flex items-center gap-1">
            <BarChartIcon className="h-4 w-4" />
            Popular Destinations
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1">
            <LineChartIcon className="h-4 w-4" />
            Monthly Revenue
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Overview</CardTitle>
              <CardDescription>
                Distribution of bookings by current status
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-80 w-full">
                <ChartContainer
                  config={{
                    pending: { color: "#FFBB28" },
                    confirmed: { color: "#00C49F" }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Status
                                    </span>
                                    <span className="font-bold text-sm">
                                      {payload[0].name}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Count
                                    </span>
                                    <span className="font-bold text-sm">
                                      {payload[0].value}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => exportToCSV(
                  bookingStatusData.map(item => ({ status: item.name, count: item.value })) || [], 
                  'booking-status-report'
                )}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export as CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Destinations</CardTitle>
              <CardDescription>
                Top destinations by booking count {confirmedOnly ? '(confirmed bookings only)' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ChartContainer
                  config={{
                    bookings: { color: "#8884d8" },
                    revenue: { color: "#82ca9d" }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularDestinationsData.map(d => ({
                        name: d.name,
                        bookings: d.count,
                        revenue: d.revenue
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent />
                        }
                      />
                      <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => exportToCSV(
                  popularDestinationsData.map(d => ({ 
                    destination: d.name, 
                    bookings: d.count, 
                    revenue: d.revenue 
                  })) || [], 
                  'popular-destinations-report'
                )}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export as CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>
                Revenue collected over the past 12 months {confirmedOnly ? '(confirmed bookings only)' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ChartContainer
                  config={{
                    revenue: { color: "#82ca9d" }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyRevenueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <XAxis 
                        dataKey="month" 
                        angle={-45} 
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#82ca9d" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => exportToCSV(
                  monthlyRevenueData.map(item => ({ 
                    month: item.month, 
                    revenue: item.revenue 
                  })) || [], 
                  'monthly-revenue-report'
                )}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export as CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-muted-foreground" />
            Recent Bookings
          </CardTitle>
          <CardDescription>
            The latest 5 bookings {confirmedOnly ? 'with confirmed status' : 'across all statuses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Destination/Event</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">People</th>
                      <th className="py-3 px-4 text-left font-medium">Amount</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((booking, i) => (
                      <tr key={booking.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                        <td className="py-3 px-4">
                          {booking.destinations?.name || booking.events?.title || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-4">{booking.number_of_people}</td>
                        <td className="py-3 px-4">${Number(booking.total_price).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent bookings found
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="ml-auto"
            onClick={() => exportToCSV(
              stats?.recentBookings.map(b => ({
                id: b.id,
                destination: b.destinations?.name || b.events?.title || "N/A",
                date: new Date(b.booking_date).toLocaleDateString(),
                people: b.number_of_people,
                amount: b.total_price,
                status: b.status,
                contact: b.contact_name,
                email: b.contact_email
              })) || [],
              'recent-bookings-report'
            )}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export Full Booking Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
