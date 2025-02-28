
import React, { useState } from "react";
import { useAccommodations } from "@/hooks/useAccommodations";
import { AccommodationCard } from "./AccommodationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Hotel, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

export const AccommodationsList = () => {
  const { data: accommodations = [], isLoading, error } = useAccommodations();
  const [searchTerm, setSearchTerm] = useState("");
  const [accommodationType, setAccommodationType] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [bedsFilter, setBedsFilter] = useState<number | null>(null);
  const [guestsFilter, setGuestsFilter] = useState<number | null>(null);

  // Filter accommodations based on search and filters
  const filteredAccommodations = accommodations.filter((accommodation) => {
    const matchesSearch = 
      accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !accommodationType || accommodation.accommodation_type === accommodationType;
    const matchesPrice = 
      accommodation.price_per_night >= priceRange[0] && 
      accommodation.price_per_night <= priceRange[1];
    const matchesBeds = !bedsFilter || accommodation.beds >= bedsFilter;
    const matchesGuests = !guestsFilter || accommodation.max_guests >= guestsFilter;
    
    return matchesSearch && matchesType && matchesPrice && matchesBeds && matchesGuests;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setAccommodationType("");
    setPriceRange([0, 1000]);
    setBedsFilter(null);
    setGuestsFilter(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading accommodations. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Hotel className="mr-2 h-6 w-6" />
          Accommodations
        </h2>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search accommodations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your accommodation search
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <Label>Accommodation Type</Label>
                  <Select 
                    value={accommodationType} 
                    onValueChange={setAccommodationType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="bnb">BnB</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="resort">Resort</SelectItem>
                      <SelectItem value="cabin">Cabin</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Price Range (per night)</Label>
                  <div className="pt-4">
                    <Slider
                      defaultValue={[0, 1000]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Minimum Beds</Label>
                  <Select 
                    value={bedsFilter?.toString() || ""} 
                    onValueChange={(value) => setBedsFilter(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any number</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Minimum Guests</Label>
                  <Select 
                    value={guestsFilter?.toString() || ""} 
                    onValueChange={(value) => setGuestsFilter(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any number</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="6">6+</SelectItem>
                      <SelectItem value="8">8+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={resetFilters} className="w-full">
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {filteredAccommodations.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-lg">
          <Hotel className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No accommodations found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
          {(searchTerm || accommodationType || priceRange[0] > 0 || priceRange[1] < 1000 || bedsFilter || guestsFilter) && (
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccommodations.map((accommodation) => (
            <AccommodationCard key={accommodation.id} accommodation={accommodation} />
          ))}
        </div>
      )}
    </div>
  );
};
