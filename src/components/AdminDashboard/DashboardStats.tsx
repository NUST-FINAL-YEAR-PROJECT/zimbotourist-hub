
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Loader2, Activity, Users, MapPin, Calendar, AlertTriangle, DollarSign } from "lucide-react";

export const DashboardStats = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

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

  const bookingStatusData = [
    { name: 'Pending', value: stats?.pendingBookings || 0 },
    { name: 'Confirmed', value: stats?.confirmedBookings || 0 }
  ];

  const popularDestinationsData = stats?.popularDestinations || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="destinations">Popular Destinations</TabsTrigger>
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
          </Card>
        </TabsContent>
        
        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Destinations</CardTitle>
              <CardDescription>
                Top destinations by booking count
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
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
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
            The latest 5 bookings across all destinations and events
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
                          {new Date(booking.booking_date).toLocaleDateString()}
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
      </Card>
    </div>
  );
};
