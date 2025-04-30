import { useState } from "react";
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
  X,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Destination } from "@/types/models";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema
const destinationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  duration_recommended: z.string().optional(),
  best_time_to_visit: z.string().optional(),
  difficulty_level: z.string().optional(),
  getting_there: z.string().optional(),
  weather_info: z.string().optional(),
  is_featured: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  additional_images: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  what_to_bring: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  additional_costs: z.record(z.string(), z.any()).nullable().optional(),
});

type DestinationFormValues = z.infer<typeof destinationFormSchema>;

export const DestinationManager = () => {
  const { 
    data: destinations, 
    isLoading, 
    error, 
    createDestination, 
    updateDestination, 
    deleteDestination 
  } = useDestinations();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<Destination | null>(null);
  const { toast } = useToast();
  
  // Create form with validation
  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: {
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
      additional_images: [],
      activities: [],
      amenities: [],
      what_to_bring: [],
      highlights: [],
      additional_costs: null,
    }
  });

  // Reset and initialize form when opening dialog
  const openFormDialog = (destination?: Destination) => {
    if (destination) {
      // Edit mode - populate form with destination data
      form.reset({
        name: destination.name,
        location: destination.location,
        price: destination.price,
        description: destination.description || "",
        image_url: destination.image_url || "",
        duration_recommended: destination.duration_recommended || "",
        best_time_to_visit: destination.best_time_to_visit || "",
        difficulty_level: destination.difficulty_level || "",
        getting_there: destination.getting_there || "",
        weather_info: destination.weather_info || "",
        is_featured: destination.is_featured || false,
        categories: destination.categories || [],
        additional_images: destination.additional_images || [],
        activities: destination.activities || [],
        amenities: destination.amenities || [],
        what_to_bring: destination.what_to_bring || [],
        highlights: destination.highlights || [],
        additional_costs: destination.additional_costs || null,
      });
      setSelectedDestination(destination);
    } else {
      // Create mode - reset form to defaults
      form.reset({
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
        additional_images: [],
        activities: [],
        amenities: [],
        what_to_bring: [],
        highlights: [],
        additional_costs: null,
      });
      setSelectedDestination(null);
    }
    setIsFormDialogOpen(true);
  };

  // Convert comma-separated string to array
  const stringToArray = (value: string): string[] => {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  };

  // Handle form submission
  const onSubmit = async (data: DestinationFormValues) => {
    try {
      // Ensure additional_costs is included in the submission
      const formData = {
        ...data,
        additional_costs: data.additional_costs || null
      };

      if (selectedDestination) {
        // Update existing destination
        await updateDestination.mutateAsync({
          id: selectedDestination.id,
          ...formData
        });
      } else {
        // Create new destination
        await createDestination.mutateAsync(formData);
      }
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Confirm and handle destination deletion
  const confirmDelete = (destination: Destination) => {
    setDestinationToDelete(destination);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (destinationToDelete) {
      try {
        await deleteDestination.mutateAsync(destinationToDelete.id);
        setDeleteDialogOpen(false);
        setDestinationToDelete(null);
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  // Filter destinations based on search term
  const filteredDestinations = destinations?.filter(destination => 
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    destination.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = createDestination.isPending || updateDestination.isPending;
  const isDeleting = deleteDestination.isPending;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Destination Management</CardTitle>
            <CardDescription>Manage travel destinations in the system</CardDescription>
          </div>
          <Button onClick={() => openFormDialog()} disabled={isLoading}>
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
          <div className="py-8 text-center text-red-500 flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>Error loading destinations: {error.message}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
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
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
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
                          onClick={() => openFormDialog(destination)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(destination)}
                          disabled={isDeleting}
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

      {/* Destination Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDestination ? `Edit ${selectedDestination.name}` : "Add New Destination"}
            </DialogTitle>
            <DialogDescription>
              {selectedDestination 
                ? "Update the destination details below" 
                : "Enter the details for the new destination"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Destination name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>Direct link to the main image</FormDescription>
                        {field.value && (
                          <div className="mt-2 border rounded p-2">
                            <img 
                              src={field.value} 
                              alt="Preview" 
                              className="h-20 object-cover mx-auto"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration_recommended"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommended Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3-5 days" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel>Featured Destination</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe this destination..." 
                            {...field} 
                            value={field.value || ''} 
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="best_time_to_visit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Time to Visit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Summer (June-August)" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Easy, Moderate, Challenging" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Adventure, Beach, Mountains, etc." 
                            value={(field.value || []).join(', ')} 
                            onChange={(e) => field.onChange(stringToArray(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Separate categories with commas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="getting_there"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Getting There</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Transportation options and directions..." 
                        {...field} 
                        value={field.value || ''} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weather_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Weather patterns and climate information..." 
                        {...field} 
                        value={field.value || ''} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activities</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Hiking, Swimming, Photography, etc." 
                        value={(field.value || []).join(', ')} 
                        onChange={(e) => field.onChange(stringToArray(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Separate activities with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="WiFi, Restaurant, Parking, etc." 
                          value={(field.value || []).join(', ')} 
                          onChange={(e) => field.onChange(stringToArray(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Separate with commas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="what_to_bring"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What to Bring</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Sunscreen, Hiking boots, Camera, etc." 
                          value={(field.value || []).join(', ')} 
                          onChange={(e) => field.onChange(stringToArray(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Separate with commas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="highlights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highlights</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Key highlights of this destination (one per line or comma-separated)" 
                        value={(field.value || []).join(', ')} 
                        onChange={(e) => field.onChange(stringToArray(e.target.value))}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormDescription>Separate highlights with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add the additional_costs field */}
              <FormField
                control={form.control}
                name="additional_costs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Costs</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter JSON format: {'Guide': 50, 'Equipment': 30}"
                        value={field.value ? JSON.stringify(field.value) : ''}
                        onChange={(e) => {
                          try {
                            // Try to parse as JSON if not empty
                            const value = e.target.value.trim() 
                              ? JSON.parse(e.target.value) 
                              : null;
                            field.onChange(value);
                          } catch (error) {
                            // If parsing fails, store as string to allow user to fix
                            console.log("Invalid JSON, storing as string");
                          }
                        }}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormDescription>Enter additional costs in JSON format (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {selectedDestination ? "Update Destination" : "Create Destination"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete "{destinationToDelete?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
