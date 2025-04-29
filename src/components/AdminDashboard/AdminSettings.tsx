
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
        <CardDescription>Configure system settings</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Admin settings functionality coming soon
        </p>
      </CardContent>
    </Card>
  );
};
