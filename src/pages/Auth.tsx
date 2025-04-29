
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
import { Loader2, ArrowRight, Mail, Lock, ArrowLeft, Globe, CheckCircle2 } from "lucide-react";
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
  const [formSuccess, setFormSuccess] = useState(false);
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
          setFormSuccess(true);
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset-password`,
        });
        
        if (error) throw error;
        
        setFormSuccess(true);
        toast({
          title: "Check your email",
          description: "We've sent you instructions to reset your password.",
        });
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

  const renderSuccessMessage = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center p-8"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">
          {mode === "signup" ? "Account Created Successfully" : "Check Your Email"}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          {mode === "signup"
            ? "Please check your email for verification instructions to complete your registration."
            : "We've sent you instructions to reset your password. Please check your email inbox."}
        </p>
        <Button 
          onClick={() => {
            setFormSuccess(false);
            setMode("signin");
          }}
          className="bg-primary hover:bg-primary/90 text-white px-6"
          size="lg"
        >
          Back to Sign In
        </Button>
      </motion.div>
    );
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base flex items-center">
              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-12 text-base bg-white shadow-sm"
            />
          </div>
          
          {mode !== "forgot-password" && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base flex items-center">
                <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === "signup" ? "Create a secure password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="h-12 text-base bg-white shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {loading
              ? "Processing..."
              : mode === "signin"
              ? "Sign In"
              : mode === "signup"
              ? "Create Account"
              : "Reset Password"}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4 text-sm pt-2">
          {mode === "signin" ? (
            <>
              <button
                type="button"
                onClick={() => setMode("forgot-password")}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                disabled={loading}
              >
                Forgot your password?
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
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
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors flex items-center"
              disabled={loading}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to sign in
            </button>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Auth Container - Full width with fixed content size */}
      <div className="w-full flex justify-center items-center">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row rounded-2xl shadow-xl overflow-hidden bg-white">
          {/* Left panel: Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-8">
                <button 
                  onClick={() => navigate('/')} 
                  className="mb-12 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </button>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center mb-2"
                >
                  <Globe className="h-6 w-6 mr-2 text-indigo-600" />
                  <span className="font-bold text-xl text-gray-900">Zimbabwe Tourism</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl font-bold tracking-tight text-gray-900"
                >
                  {formSuccess 
                    ? "Success!" 
                    : mode === "signin"
                    ? "Welcome back"
                    : mode === "signup"
                    ? "Create your account"
                    : "Reset your password"}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-600 mt-2"
                >
                  {formSuccess 
                    ? "Please check your email" 
                    : mode === "signin"
                    ? "Sign in to access your account"
                    : mode === "signup"
                    ? "Join us and start exploring Zimbabwe"
                    : "We'll send you instructions via email"}
                </motion.p>
              </div>
              
              {formSuccess ? renderSuccessMessage() : renderForm()}
            </div>
          </div>
          
          {/* Right panel: Image and information */}
          <div className="hidden lg:block w-1/2 bg-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
                alt="Victoria Falls, Zimbabwe"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-indigo-800/70 to-indigo-900/80" />
            </div>
            
            <div className="relative h-full flex flex-col justify-between p-12 text-white">
              <div>
                <h2 className="text-3xl font-bold mb-6">Discover the Beauty of Zimbabwe</h2>
                <p className="text-white/90 text-lg max-w-md">
                  From the majestic Victoria Falls to the ancient ruins of Great Zimbabwe, 
                  embark on a journey through breathtaking landscapes and rich cultural heritage.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 max-w-lg">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">120+</h3>
                  <p className="text-sm text-white/80">Unique destinations to explore</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">5000+</h3>
                  <p className="text-sm text-white/80">Happy travelers last year</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">98%</h3>
                  <p className="text-sm text-white/80">Customer satisfaction rate</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">24/7</h3>
                  <p className="text-sm text-white/80">Support for our members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
