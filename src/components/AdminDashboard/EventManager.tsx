
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const EventManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Management</CardTitle>
        <CardDescription>Manage travel events and programs</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Event management functionality coming soon
        </p>
      </CardContent>
    </Card>
  );
};
