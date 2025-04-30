
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDestinations } from "@/hooks/useDestinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, 
  Pencil, 
  Trash, 
  ImageIcon, 
  Loader2,
  Check,
  X  
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/types/models";

export const DestinationManager = () => {
  const { data: destinations, isLoading, error, refetch } = useDestinations();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<Partial<Destination>>({
    name: "",
    location: "",
    price: 0,
    description: "",
    image_url: "",
    duration_recommended: "",
    best_time_to_visit: "",
    difficulty_level: "",
    getting_there: "",
    weather_info: "",
    is_featured: false,
    categories: [],
  });

  // Reset form when opening/closing dialog
  useEffect(() => {
    if (isAddDialogOpen) {
      if (selectedDestination) {
        setFormData({
          name: selectedDestination.name,
          location: selectedDestination.location,
          price: selectedDestination.price,
          description: selectedDestination.description || "",
          image_url: selectedDestination.image_url || "",
          duration_recommended: selectedDestination.duration_recommended || "",
          best_time_to_visit: selectedDestination.best_time_to_visit || "",
          difficulty_level: selectedDestination.difficulty_level || "",
          getting_there: selectedDestination.getting_there || "",
          weather_info: selectedDestination.weather_info || "",
          is_featured: selectedDestination.is_featured || false,
          categories: selectedDestination.categories || [],
        });
      } else {
        setFormData({
          name: "",
          location: "",
          price: 0,
          description: "",
          image_url: "",
          duration_recommended: "",
          best_time_to_visit: "",
          difficulty_level: "",
          getting_there: "",
          weather_info: "",
          is_featured: false,
          categories: [],
        });
      }
    }
  }, [isAddDialogOpen, selectedDestination]);

  // Filter destinations based on search term
  const filteredDestinations = destinations?.filter(destination => 
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    destination.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsAddDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Split by comma and trim whitespace
    const categoriesArray = value.split(',').map(cat => cat.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      categories: categoriesArray
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.name || !formData.location || formData.price === undefined) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      let result;

      if (selectedDestination) {
        // Update existing destination
        result = await supabase
          .from('destinations')
          .update({
            name: formData.name,
            location: formData.location,
            price: formData.price,
            description: formData.description,
            image_url: formData.image_url,
            duration_recommended: formData.duration_recommended,
            best_time_to_visit: formData.best_time_to_visit,
            difficulty_level: formData.difficulty_level,
            getting_there: formData.getting_there,
            weather_info: formData.weather_info,
            is_featured: formData.is_featured,
            categories: formData.categories,
          })
          .eq('id', selectedDestination.id);

        if (result.error) throw result.error;
        
        toast({
          title: "Destination updated",
          description: `${formData.name} has been updated successfully`,
          variant: "success"
        });
      } else {
        // Add new destination
        result = await supabase
          .from('destinations')
          .insert({
            name: formData.name,
            location: formData.location,
            price: formData.price,
            description: formData.description,
            image_url: formData.image_url,
            duration_recommended: formData.duration_recommended,
            best_time_to_visit: formData.best_time_to_visit,
            difficulty_level: formData.difficulty_level,
            getting_there: formData.getting_there,
            weather_info: formData.weather_info,
            is_featured: formData.is_featured,
            categories: formData.categories,
          });

        if (result.error) throw result.error;
        
        toast({
          title: "Destination added",
          description: `${formData.name} has been added successfully`,
          variant: "success"
        });
      }

      // Refetch destinations after adding/updating
      await refetch();
      
      // Close the dialog
      setIsAddDialogOpen(false);
      setSelectedDestination(null);
    } catch (error) {
      console.error("Error saving destination:", error);
      toast({
        title: "Error",
        description: "Failed to save destination. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (destination: Destination) => {
    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destination.id);

      if (error) throw error;

      toast({
        title: "Destination deleted",
        description: `${destination.name} has been removed`,
        variant: "success"
      });

      // Refetch destinations after deleting
      await refetch();
    } catch (error) {
      console.error("Error deleting destination:", error);
      toast({
        title: "Error",
        description: "Failed to delete destination. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Destination Management</CardTitle>
            <CardDescription>Manage travel destinations in the system</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Destination
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading destinations...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            Error loading destinations: {error.message}
          </div>
        ) : filteredDestinations?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchTerm ? "No destinations found matching your search." : "No destinations have been added yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDestinations?.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell>
                      {destination.image_url ? (
                        <img 
                          src={destination.image_url} 
                          alt={destination.name} 
                          className="h-10 w-16 object-cover rounded" 
                        />
                      ) : (
                        <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{destination.name}</TableCell>
                    <TableCell>{destination.location}</TableCell>
                    <TableCell>${destination.price}</TableCell>
                    <TableCell>{destination.duration_recommended || "—"}</TableCell>
                    <TableCell>
                      {destination.is_featured ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(destination)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(destination)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Destination Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDestination ? "Edit Destination" : "Add New Destination"}
            </DialogTitle>
            <DialogDescription>
              {selectedDestination 
                ? "Update the destination details below" 
                : "Enter the details for the new destination"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-right">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="name"
                  placeholder="Destination name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-right">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="location"
                  placeholder="City, Country" 
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-right">
                  Price ($) <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="price"
                  type="number" 
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={handleNumberInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="image_url" className="text-right">Image URL</Label>
                <Input 
                  id="image_url"
                  placeholder="https://example.com/image.jpg" 
                  value={formData.image_url || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                {formData.image_url && (
                  <div className="mt-2 border rounded p-2">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="h-20 object-cover mx-auto"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="categories" className="text-right">Categories (comma separated)</Label>
                <Input 
                  id="categories"
                  placeholder="Adventure, Beach, Mountains, etc." 
                  value={(formData.categories || []).join(', ')}
                  onChange={handleCategoryInputChange}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="is_featured" 
                  checked={!!formData.is_featured} 
                  onChange={handleCheckboxChange}
                  className="h-4 w-4" 
                />
                <Label htmlFor="is_featured">Featured Destination</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe this destination..." 
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="duration_recommended" className="text-right">Recommended Duration</Label>
                <Input 
                  id="duration_recommended"
                  placeholder="e.g., 3-5 days" 
                  value={formData.duration_recommended || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="best_time_to_visit" className="text-right">Best Time to Visit</Label>
                <Input 
                  id="best_time_to_visit"
                  placeholder="e.g., Summer (June-August)" 
                  value={formData.best_time_to_visit || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty_level" className="text-right">Difficulty Level</Label>
                <Input 
                  id="difficulty_level"
                  placeholder="e.g., Easy, Moderate, Challenging" 
                  value={formData.difficulty_level || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-2">
            <div>
              <Label htmlFor="weather_info" className="text-right">Weather Information</Label>
              <Textarea 
                id="weather_info"
                placeholder="Weather patterns and climate information..." 
                value={formData.weather_info || ""}
                onChange={handleInputChange}
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="getting_there" className="text-right">Getting There</Label>
              <Textarea 
                id="getting_there"
                placeholder="Transportation options and directions..." 
                value={formData.getting_there || ""}
                onChange={handleInputChange}
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-between flex-wrap gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setSelectedDestination(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {selectedDestination ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  <>{selectedDestination ? "Save Changes" : "Add Destination"}</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
