
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const QuickAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  // This would normally be stored securely, but for demo purposes we're hardcoding
  // In a real app, these would be environment variables or stored securely
  const adminCredentials = {
    email: "admin@reserve.zw",
    password: "admin123"
  };

  const createAdminIfNeeded = async () => {
    try {
      // First, check if admin user exists by trying to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminCredentials.email,
        password: adminCredentials.password,
      });
      
      if (signInError && signInError.message.includes("Invalid login credentials")) {
        console.log("Admin user doesn't exist yet. Creating new admin account...");
        
        // Admin doesn't exist, so create a new admin user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: adminCredentials.email,
          password: adminCredentials.password,
        });
        
        if (signUpError) {
          throw signUpError;
        }
        
        // If signup was successful, set their role to ADMIN in the profiles table
        if (signUpData.user) {
          try {
            // Call our edge function to create profiles table if it doesn't exist
            const response = await fetch("https://gduzxexxpbibimtiycur.supabase.co/functions/v1/create-profiles-table", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${signUpData.session?.access_token || ""}`,
              },
            });

            if (!response.ok) {
              console.error("Error creating profiles table:", await response.text());
            }
          } catch (e) {
            console.log("Error calling create-profiles-table function:", e);
          }
          
          // Create profile with ADMIN role
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: signUpData.user.id,
              email: adminCredentials.email,
              role: 'ADMIN'
            });
            
          if (profileError) {
            console.error("Error creating admin profile:", profileError);
          }
          
          console.log("Admin account created successfully!");
          return true;
        }
      } else if (signInData?.user) {
        // Admin exists already
        console.log("Admin account already exists, proceeding with login");
        
        try {
          // Check if profiles table exists
          const { error: testError } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });
            
          if (testError && testError.message.includes('relation "profiles" does not exist')) {
            // Create the profile with ADMIN role since table doesn't exist
            try {
              // Call our edge function to create profiles table
              const response = await fetch("https://gduzxexxpbibimtiycur.supabase.co/functions/v1/create-profiles-table", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${signInData.session?.access_token || ""}`,
                },
              });

              if (!response.ok) {
                console.error("Error creating profiles table:", await response.text());
              } else {
                // Then create the profile
                await supabase
                  .from('profiles')
                  .upsert({
                    id: signInData.user.id,
                    email: adminCredentials.email,
                    role: 'ADMIN'
                  });
              }
            } catch (e) {
              console.error("Failed to create profiles table:", e);
            }
          } else {
            // Double check if the profile has ADMIN role, if not update it
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', signInData.user.id)
              .single();
              
            if (!profileData || profileData.role !== 'ADMIN') {
              console.log("Updating profile to ADMIN role");
              await supabase
                .from('profiles')
                .upsert({
                  id: signInData.user.id,
                  email: adminCredentials.email,
                  role: 'ADMIN'
                });
            }
          }
        } catch (e) {
          console.error("Error checking or creating profile:", e);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error creating admin account:", error);
      return false;
    }
  };

  const handleQuickAdminLogin = async () => {
    try {
      setLoading(true);
      
      // First try to create admin if needed
      const adminReady = await createAdminIfNeeded();
      
      if (!adminReady) {
        throw new Error("Failed to setup admin account");
      }
      
      // Now login with the admin credentials
      const response = await loginWithCredentials(adminCredentials.email, adminCredentials.password);
      
      toast.success("Successfully logged in as admin!");
      // Give the auth state a moment to update
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error("Failed to login as admin: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleQuickAdminLogin}
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2 border-amber-500 text-amber-600 hover:bg-amber-50"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShieldCheck className="h-4 w-4" />
      )}
      Quick Admin Access
    </Button>
  );
};
