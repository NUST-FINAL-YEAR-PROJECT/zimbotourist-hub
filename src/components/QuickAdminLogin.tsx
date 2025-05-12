
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const QuickAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithCredentials } = useAuth();

  // This would normally be stored securely, but for demo purposes we're hardcoding
  // In a real app, these would be environment variables or stored securely
  const adminCredentials = {
    email: "admin@reserve.zw",
    password: "admin123"
  };

  const handleQuickAdminLogin = async () => {
    try {
      setLoading(true);
      await loginWithCredentials(adminCredentials.email, adminCredentials.password);
      toast.success("Successfully logged in as admin!");
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
