import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
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

type AuthMode = "signin" | "signup" | "forgot-password" | "reset-password";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
        setMode("signin");
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email for password reset instructions.",
        });
        setMode("signin");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "signin"
                ? "Welcome Back"
                : mode === "signup"
                ? "Create Account"
                : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {mode === "signin"
                ? "Sign in to your account to continue"
                : mode === "signup"
                ? "Create a new account to get started"
                : "Enter your email to reset your password"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {mode !== "forgot-password" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                  ? "Sign Up"
                  : "Reset Password"}
              </Button>
              <div className="flex flex-col items-center space-y-2 text-sm">
                {mode === "signin" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode("forgot-password")}
                      className="text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                    <div className="flex items-center space-x-1">
                      <span>Don't have an account?</span>
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-primary hover:underline"
                      >
                        Sign up
                      </button>
                    </div>
                  </>
                ) : mode === "signup" ? (
                  <div className="flex items-center space-x-1">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-primary hover:underline"
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