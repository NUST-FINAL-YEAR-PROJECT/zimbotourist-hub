
import React from "react";
import { useNavigate } from "react-router-dom";
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

interface DuplicateBookingAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  destinationName?: string;
}

export function DuplicateBookingAlert({
  open,
  onOpenChange,
  onContinue,
  destinationName = "this destination",
}: DuplicateBookingAlertProps) {
  const navigate = useNavigate();

  const handleViewBookings = () => {
    navigate("/dashboard/bookings");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Booking Detected</AlertDialogTitle>
          <AlertDialogDescription>
            You already have a pending booking for {destinationName}. Would you like to view your 
            existing bookings to complete payment or cancel, or continue with a new booking anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleViewBookings} className="bg-blue-600 hover:bg-blue-700">
            View My Bookings
          </AlertDialogAction>
          <AlertDialogAction onClick={onContinue} className="bg-green-600 hover:bg-green-700">
            Continue Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
