
import { useAccommodations } from "@/hooks/useAccommodations";
import { AccommodationCard } from "@/components/AccommodationCard";
import { Loader2 } from "lucide-react";

interface AccommodationListProps {
  destinationId?: string;
}

export const AccommodationList = ({ destinationId }: AccommodationListProps) => {
  const { data: accommodations, isLoading, error } = useAccommodations(destinationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load accommodations
      </div>
    );
  }

  if (!accommodations?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No accommodations found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accommodations.map((accommodation) => (
        <AccommodationCard
          key={accommodation.id}
          {...accommodation}
        />
      ))}
    </div>
  );
};
