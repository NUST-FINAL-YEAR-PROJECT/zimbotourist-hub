import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
import { Loader2, ArrowRight, Mail, Lock, ArrowLeft, Globe, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";

type AuthMode = "signin" | "signup" | "forgot-password" | "reset-password" | "admin-signin";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAdminPage = searchParams.get("admin") === "true";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : isAdminPage ? "admin-signin" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loginWithCredentials } = useAuth();
  
  // Set mode based on URL parameters
  useEffect(() => {
    if (isAdminPage) {
      setMode("admin-signin");
    }
  }, [isAdminPage]);

  // Direct redirects without animations or delays
  useEffect(() => {
    if (user) {
      const redirectPath = isAdmin ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const validateForm = () => {
    if (!email) {
      toast.error("Please enter your email");
      return false;
    }

    if (mode !== "forgot-password" && !password) {
      toast.error("Please enter your password");
      return false;
    }

    if (mode !== "forgot-password" && password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (mode === "signin" || mode === "admin-signin") {
        // Sign in directly without waiting for redirects to happen in useEffect
        const { isAdmin } = await loginWithCredentials(email, password);
        // Redirect immediately instead of waiting for auth state change events
        navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
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
          toast.error("Account exists");
          setMode("signin");
        } else {
          setFormSuccess(true);
          toast.success("Account created!");
        }
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset-password`,
        });
        
        if (error) throw error;
        
        setFormSuccess(true);
        toast.success("Check your email");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            admin: isAdminPage ? 'true' : 'false'
          }
        }
      });
      
      if (error) throw error;
      
      toast.info("Redirecting to Google login...");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
      setGoogleLoading(false);
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
    const isAdminMode = mode === "admin-signin";
    
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
              type="text"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || googleLoading}
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
                disabled={loading || googleLoading}
                minLength={6}
                className="h-12 text-base bg-white shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className={`w-full h-12 text-base font-semibold ${
              isAdminMode 
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" 
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            } text-white`}
            disabled={loading || googleLoading}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {loading
              ? "Processing..."
              : isAdminMode
              ? "Administrator Sign In"
              : mode === "signin"
              ? "Sign In"
              : mode === "signup"
              ? "Create Account"
              : "Reset Password"}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>

        {/* Only show Google sign-in for non-admin modes */}
        {!isAdminMode && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base flex items-center justify-center gap-2 border-gray-300"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  <span>Sign {mode === "signin" ? "in" : "up"} with Google</span>
                </>
              )}
            </Button>
          </>
        )}

        <div className="flex flex-col items-center space-y-4 text-sm pt-2">
          {mode === "signin" ? (
            <>
              <button
                type="button"
                onClick={() => setMode("forgot-password")}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                disabled={loading || googleLoading}
              >
                Forgot your password?
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                  disabled={loading || googleLoading}
                >
                  Sign up
                </button>
              </div>
              <Button
                type="button"
                onClick={() => setMode("admin-signin")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-amber-500 text-amber-600 hover:bg-amber-50"
                disabled={loading || googleLoading}
              >
                <ShieldCheck className="h-4 w-4" />
                Administrator Access
              </Button>
            </>
          ) : mode === "admin-signin" ? (
            <>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors flex items-center"
                disabled={loading || googleLoading}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to user sign in
              </button>
            </>
          ) : mode === "signup" ? (
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Already have an account?</span>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                disabled={loading || googleLoading}
              >
                Sign in
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors flex items-center"
              disabled={loading || googleLoading}
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
                  {mode === "admin-signin" ? (
                    <ShieldCheck className="h-6 w-6 mr-2 text-amber-500" />
                  ) : (
                    <Globe className="h-6 w-6 mr-2 text-indigo-600" />
                  )}
                  <span className="font-bold text-xl text-gray-900">
                    {mode === "admin-signin" ? "Admin Portal" : "Zimbabwe Tourism"}
                  </span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl font-bold tracking-tight text-gray-900"
                >
                  {formSuccess 
                    ? "Success!" 
                    : mode === "admin-signin"
                    ? "Administrator Access"
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
                    : mode === "admin-signin"
                    ? "Sign in with your admin credentials"
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
