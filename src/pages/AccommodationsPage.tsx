
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Accommodation } from "@/types/models";

export const AccommodationsPage = () => {
  const { data: accommodations, isLoading } = useQuery({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select(`
          *,
          destinations (
            name,
            location
          ),
          accommodation_bookings (
            id,
            check_in_date,
            check_out_date,
            number_of_guests,
            status,
            payment_status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching accommodations:", error);
        toast.error("Failed to fetch accommodations");
        throw error;
      }

      return data as (Accommodation & {
        accommodation_bookings: {
          id: string;
          check_in_date: string;
          check_out_date: string;
          number_of_guests: number;
          status: string;
          payment_status: string;
        }[];
      })[];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!accommodations?.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-3">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No accommodations found</h2>
          <p className="text-muted-foreground">
            There are no accommodations available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Accommodations</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accommodations.map((accommodation) => (
          <Card key={accommodation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{accommodation.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {accommodation.destinations?.name}, {accommodation.destinations?.location}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Details</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>Price per night: ${accommodation.price_per_night}</li>
                    <li>Max guests: {accommodation.max_guests}</li>
                    <li>Bedrooms: {accommodation.bedrooms}</li>
                    <li>Bathrooms: {accommodation.bathrooms}</li>
                  </ul>
                </div>
                {accommodation.accommodation_bookings?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Current Bookings</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-2">
                      {accommodation.accommodation_bookings.map((booking) => (
                        <li key={booking.id} className="p-2 bg-secondary/30 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span>
                              {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                              {new Date(booking.check_out_date).toLocaleDateString()}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="mt-1 flex justify-between text-xs">
                            <span>{booking.number_of_guests} guests</span>
                            <span
                              className={`${
                                booking.payment_status === "completed"
                                  ? "text-green-600"
                                  : booking.payment_status === "pending"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              Payment: {booking.payment_status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
