
import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";

interface AuthRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  destinationLink?: string;
}

export const AuthRequiredDialog = ({
  isOpen,
  onClose,
  destinationLink = "/auth?mode=signup",
}: AuthRequiredDialogProps) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(destinationLink);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, navigate, onClose, destinationLink]);

  const handleLogin = () => {
    navigate("/auth");
    onClose();
  };

  const handleSignup = () => {
    navigate("/auth?mode=signup");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Authentication Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to be logged in to book this accommodation or destination.
            <br />
            <br />
            Redirecting to signup in {countdown} seconds...
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={handleLogin}>
            Sign In
          </Button>
          <AlertDialogAction onClick={handleSignup}>
            Sign Up
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
