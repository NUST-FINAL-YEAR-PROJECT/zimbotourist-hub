
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Bed, Bath, Users, DollarSign, MapPin } from "lucide-react";
import { AccommodationBookingForm } from "@/components/AccommodationBookingForm";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const AccommodationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: accommodation, isLoading } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select(`
          *,
          destinations (
            name,
            location
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching accommodation:", error);
        toast.error("Failed to fetch accommodation details");
        throw error;
      }

      if (!data) {
        toast.error("Accommodation not found");
        throw new Error("Accommodation not found");
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Accommodation not found</h2>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/accommodations">Accommodations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{accommodation.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
              <img
                src={accommodation.image_url || "/placeholder.svg"}
                alt={accommodation.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{accommodation.name}</h1>
                {accommodation.destinations && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    {accommodation.destinations.name}, {accommodation.destinations.location}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-4 rounded-lg bg-secondary/30">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{accommodation.bedrooms}</p>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-lg bg-secondary/30">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{accommodation.bathrooms}</p>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-lg bg-secondary/30">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{accommodation.max_guests}</p>
                    <p className="text-sm text-muted-foreground">Max guests</p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About this place</h2>
                <p className="text-muted-foreground">{accommodation.description}</p>
              </div>

              {accommodation.amenities && accommodation.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {accommodation.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30"
                      >
                        <span className="font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="sticky top-8 space-y-6">
              <div className="rounded-xl border p-6 shadow-sm">
                <div className="flex justify-between items-baseline mb-4">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      ${accommodation.price_per_night}
                    </div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-6">Book Your Stay</h2>
                      <AccommodationBookingForm accommodation={accommodation} />
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="mt-6 text-sm text-muted-foreground space-y-2">
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Up to {accommodation.max_guests} guests
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Instant booking available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
