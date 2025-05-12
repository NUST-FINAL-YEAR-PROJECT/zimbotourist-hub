
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const AdminPromotion = () => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Access</CardTitle>
        <CardDescription>
          Access administrator features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 text-gray-600">
          Anyone can access the administrative dashboard and features.
          No special permissions are required.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate('/admin/dashboard')} 
          className="w-full"
        >
          Go to Admin Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};
