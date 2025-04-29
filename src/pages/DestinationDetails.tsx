
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Calendar, Clock, Star, Activity, ArrowLeft, 
  Home, Heart, DollarSign, Check, Info, Share, ChevronRight, 
  Users, Phone, Mail
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { BookingForm } from "@/components/BookingForm";
import { ReviewSection } from "@/components/ReviewSection";
import { SimilarDestinations } from "@/components/SimilarDestinations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState } from "react";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDestination } from "@/hooks/useDestinations";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const DestinationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  const { data: destination, isLoading, error } = useDestination(id || '');

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookNowClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setShowBookingDialog(true);
  };
  
  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: destination?.name || "Zimbabwe Tourism Destination",
        text: `Check out ${destination?.name} on Zimbabwe Tourism!`,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared successfully!",
          variant: "success"
        });
      })
      .catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard!",
        description: "You can now share it with your friends",
        variant: "success"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-[400px] rounded-2xl w-full" />
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-[300px] rounded-xl w-full" />
              <Skeleton className="h-[200px] rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Info className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Destination not found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the destination you're looking for. It may have been removed or you might have followed an invalid link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/destinations')} className="gap-2">
              <Home className="h-4 w-4" />
              Browse Destinations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold truncate">{destination.name}</span>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleShareClick}>
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 mt-14 md:mt-8 max-w-7xl">
        {/* Breadcrumb Navigation - Hidden on Mobile */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 hidden md:block"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="hover:text-primary transition-colors">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/destinations" className="hover:text-primary transition-colors">
                  Destinations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {destination.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg group"
            >
              <img
                src={destination.image_url || "/placeholder.svg"}
                alt={destination.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/80 text-primary hover:bg-white">
                    ${destination.price}
                  </Badge>
                  
                  {destination.categories && destination.categories.length > 0 && (
                    <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
                      {destination.categories[0]}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
                    onClick={handleShareClick}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Destination Info */}
            <div className="space-y-6 animate-fade-in">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-foreground"
              >
                {destination.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{destination.location}</span>
                </div>
                {destination.best_time_to_visit && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{destination.best_time_to_visit}</span>
                  </div>
                )}
                {destination.duration_recommended && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{destination.duration_recommended}</span>
                  </div>
                )}
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-gray-600 leading-relaxed"
              >
                {destination.description}
              </motion.p>

              {/* Activities */}
              {destination.activities && destination.activities.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Activities
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {destination.activities.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <Activity className="h-5 w-5 text-primary" />
                            <span className="font-medium">{activity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Amenities */}
              {destination.amenities && destination.amenities.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Amenities
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {destination.amenities.map((amenity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <Check className="h-4 w-4 text-primary" />
                            <span className="font-medium">{amenity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Reviews Section */}
              <ReviewSection destinationId={destination.id} />
            </div>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Booking Card */}
            <Card className="border-none shadow-lg sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold text-primary">
                  ${destination.price}
                </CardTitle>
                <CardDescription>per person</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBookNowClick}
                >
                  Book Now
                </Button>
                
                <AuthRequiredDialog 
                  isOpen={showAuthDialog} 
                  onClose={() => setShowAuthDialog(false)} 
                />
                
                <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-4">
                      <h2 className="text-2xl font-bold mb-6">Book Your Trip to {destination.name}</h2>
                      {destination && (
                        <BookingForm 
                          destination={destination}
                          onSuccess={() => {
                            setShowBookingDialog(false);
                            navigate("/dashboard/bookings");
                          }}
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="text-sm space-y-3 bg-secondary/30 p-4 rounded-lg">
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Free cancellation up to 24 hours before departure
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Instant confirmation
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Expert local guides
                  </p>
                </div>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Need Help Booking?</h4>
                        <p className="text-muted-foreground text-xs mt-1">
                          Contact our travel experts for personalized assistance with your booking.
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                            <Phone className="h-3.5 w-3.5" />
                            Call Now
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                            <Mail className="h-3.5 w-3.5" />
                            Email Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-none">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium text-sm">Ideal for</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">Small Groups</span>
                        <p className="text-xs text-muted-foreground">
                          2-10 people
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Similar Destinations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Similar Destinations</h3>
                <Button 
                  variant="link" 
                  className="text-sm p-0 h-auto"
                  onClick={() => navigate('/destinations')}
                >
                  View all
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <SimilarDestinations destinationId={destination?.id} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
