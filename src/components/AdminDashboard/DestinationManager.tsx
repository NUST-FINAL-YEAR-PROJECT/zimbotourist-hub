
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
import { 
  PlusCircle, 
  Pencil, 
  Trash, 
  ImageIcon, 
  Loader2 
} from "lucide-react";
import type { Destination } from "@/types/models";

export const DestinationManager = () => {
  const { data: destinations, isLoading, error } = useDestinations();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Filter destinations based on search term
  const filteredDestinations = destinations?.filter(destination => 
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    destination.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsAddDialogOpen(true);
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
                    <TableCell>{destination.is_featured ? "Yes" : "No"}</TableCell>
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
        <DialogContent className="sm:max-w-md">
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
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                placeholder="Destination name" 
                defaultValue={selectedDestination?.name || ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location"
                placeholder="City, Country" 
                defaultValue={selectedDestination?.location || ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input 
                id="price"
                type="number" 
                placeholder="0.00" 
                defaultValue={selectedDestination?.price || ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input 
                id="image"
                placeholder="https://example.com/image.jpg" 
                defaultValue={selectedDestination?.image_url || ""}
              />
            </div>

            {/* Add more fields as needed */}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setSelectedDestination(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button">
              {selectedDestination ? "Save Changes" : "Add Destination"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
