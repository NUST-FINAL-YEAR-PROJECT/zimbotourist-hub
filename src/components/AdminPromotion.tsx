
import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useUserOperations } from "@/hooks/useUserOperations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminPromotion = () => {
  const { user, session, isAdmin } = useAuth();
  const { promoteToAdmin, isLoading } = useUserOperations();
  const [promoted, setPromoted] = useState(false);
  const navigate = useNavigate();

  const handlePromote = async () => {
    if (!user) return;
    
    const success = await promoteToAdmin();
    if (success) {
      setPromoted(true);
      // Give time for the toast to show
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    }
  };

  if (isAdmin) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <ShieldCheck className="h-5 w-5" /> Admin Access
          </CardTitle>
          <CardDescription>
            You already have administrator privileges.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/admin/dashboard')}
          >
            Go to Admin Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Become Administrator</CardTitle>
        <CardDescription>
          Promote your account to have administrator privileges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 text-gray-600">
          This will update your user profile to have the ADMIN role, 
          giving you access to the administrative dashboard and features.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePromote} 
          disabled={isLoading || promoted} 
          className="w-full"
          variant={promoted ? "outline" : "default"}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {promoted ? "Successfully promoted! Redirecting..." : "Promote to Admin"}
        </Button>
      </CardFooter>
    </Card>
  );
};
