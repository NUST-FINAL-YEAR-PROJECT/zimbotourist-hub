import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { Bell, Key, Shield, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";

interface SettingsFormValues {
  emailNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>();

  // Get the current user's profile
  const { data: profile, isLoading } = useProfile(userId);

  // Initialize form with default values
  const form = useForm<SettingsFormValues>({
    defaultValues: {
      emailNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  // Fetch current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      // Here you would typically save the settings to your backend
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Form {...form}>
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <FormLabel>Email</FormLabel>
                  <Input value={profile?.email} disabled />
                  <FormDescription>
                    Your email address is used for account-related notifications
                  </FormDescription>
                </div>

                <div>
                  <FormLabel>Username</FormLabel>
                  <Input value={profile?.username || ""} disabled />
                  <FormDescription>
                    Your username is visible to other users
                  </FormDescription>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Bell className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how you receive notifications
                  </p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Email Notifications
                        </FormLabel>
                        <FormDescription>
                          Receive notifications about your bookings and events
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Marketing Emails
                        </FormLabel>
                        <FormDescription>
                          Receive emails about new features and special offers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="securityAlerts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Security Alerts
                        </FormLabel>
                        <FormDescription>
                          Receive alerts about your account security
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </form>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your account security settings
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Password change functionality will be available soon.",
                    });
                  }}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}