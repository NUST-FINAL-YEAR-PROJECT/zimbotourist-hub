
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Bed, Users, Bath, DollarSign } from "lucide-react";

interface AccommodationCardProps {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  destination?: {
    name: string;
    location: string;
  } | null;
}

export const AccommodationCard = ({
  id,
  name,
  description,
  image_url,
  price_per_night,
  bedrooms,
  bathrooms,
  max_guests,
  destination,
}: AccommodationCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={() => navigate(`/accommodation/${id}`)}>
        <div className="aspect-[16/9] relative overflow-hidden">
          <img
            src={image_url || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-sm">
              <DollarSign className="h-4 w-4" />
              {price_per_night} per night
            </span>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
              {destination && (
                <p className="text-sm text-muted-foreground">
                  {destination.name}, {destination.location}
                </p>
              )}
            </div>

            <p className="text-muted-foreground line-clamp-2 text-sm">
              {description}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Bed className="h-4 w-4 text-primary" />
                <span>{bedrooms} {bedrooms === 1 ? "Bedroom" : "Bedrooms"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bath className="h-4 w-4 text-primary" />
                <span>{bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>Up to {max_guests}</span>
              </div>
            </div>

            <Button className="w-full mt-4" variant="secondary">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
