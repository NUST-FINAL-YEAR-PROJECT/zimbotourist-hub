
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type AuthMode = "signin" | "signup" | "forgot-password" | "reset-password";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email",
      });
      return false;
    }

    if (mode !== "forgot-password" && !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your password",
      });
      return false;
    }

    if (mode !== "forgot-password" && password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return false;
    }

    if (!email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return false;
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        if (data.session) {
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
          });
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        });
        
        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          toast({
            variant: "destructive",
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
          setMode("signin");
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
          setMode("signin");
        }
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset-password`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you instructions to reset your password.",
        });
        setMode("signin");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-3xl font-bold text-center tracking-tight">
              {mode === "signin"
                ? "Welcome Back"
                : mode === "signup"
                ? "Create Account"
                : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {mode === "signin"
                ? "Sign in to your account to continue"
                : mode === "signup"
                ? "Create a new account to get started"
                : "Enter your email to reset your password"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 text-base"
                />
              </div>
              {mode !== "forgot-password" && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="h-12 text-base"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                  ? "Sign Up"
                  : "Reset Password"}
              </Button>
              <div className="flex flex-col items-center space-y-4 text-sm">
                {mode === "signin" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode("forgot-password")}
                      className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Don't have an account?</span>
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                        disabled={loading}
                      >
                        Sign up
                      </button>
                    </div>
                  </>
                ) : mode === "signup" ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                      disabled={loading}
                    >
                      Sign in
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                    disabled={loading}
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
