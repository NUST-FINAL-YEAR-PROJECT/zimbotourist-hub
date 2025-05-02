
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { EventForm, EventFormValues } from "./EventForm";
import { useEventOperations } from "@/hooks/useEventOperations";
import { format } from "date-fns";
import { Pencil, Plus, Trash } from "lucide-react";
import type { Event } from "@/types/models";

export const EventManager = () => {
  const {
    events,
    isFetchingEvents,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEventOperations();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // This formData contains Date objects which will be converted to ISO strings in useEventOperations
  const handleCreateSubmit = (formData: EventFormValues) => {
    createEvent.mutate({
      title: formData.title,
      description: formData.description || null,
      location: formData.location || null,
      price: formData.price || null,
      start_date: formData.start_date as any, // TypeScript workaround, conversion handled in hook
      end_date: formData.end_date as any, // TypeScript workaround, conversion handled in hook
      image_url: formData.image_url || null,
      event_type: formData.event_type || null,
      program_url: formData.program_url || null,
      program_name: formData.program_name || null,
      program_type: formData.program_type || null,
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleEditSubmit = (formData: EventFormValues) => {
    if (selectedEvent) {
      updateEvent.mutate(
        {
          id: selectedEvent.id,
          data: {
            title: formData.title,
            description: formData.description || null,
            location: formData.location || null,
            price: formData.price || null,
            start_date: formData.start_date as any, // TypeScript workaround, conversion handled in hook
            end_date: formData.end_date as any, // TypeScript workaround, conversion handled in hook
            image_url: formData.image_url || null,
            event_type: formData.event_type || null,
            program_url: formData.program_url || null,
            program_name: formData.program_name || null,
            program_type: formData.program_type || null,
          },
        },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedEvent(null);
          },
        }
      );
    }
  };

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedEvent) {
      deleteEvent.mutate(selectedEvent.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedEvent(null);
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Event Management</CardTitle>
          <CardDescription>
            Create, update, and delete travel events and programs
          </CardDescription>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        {isFetchingEvents ? (
          <div className="flex justify-center py-8">
            <p>Loading events...</p>
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No events found. Create your first event to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      {event.image_url ? (
                        <div className="relative h-12 w-16 rounded overflow-hidden">
                          <img 
                            src={event.image_url} 
                            alt={event.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-16 bg-muted flex items-center justify-center rounded">
                          <span className="text-xs text-muted-foreground">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.location || "-"}</TableCell>
                    <TableCell>
                      {event.start_date ? (
                        <span>
                          {format(new Date(event.start_date), "MMM d, yyyy")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {event.price ? `$${event.price}` : "Free"}
                    </TableCell>
                    <TableCell>{event.event_type || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(event)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create Event Dialog */}
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new event.
              </DialogDescription>
            </DialogHeader>
            <EventForm
              onSubmit={handleCreateSubmit}
              isLoading={isLoading || createEvent.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedEvent(null);
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the event details below.
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <EventForm
                event={selectedEvent}
                onSubmit={handleEditSubmit}
                isLoading={isLoading || updateEvent.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) setSelectedEvent(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                event "{selectedEvent?.title}" and all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={handleConfirmDelete}
              >
                {isLoading || deleteEvent.isPending
                  ? "Deleting..."
                  : "Delete Event"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
