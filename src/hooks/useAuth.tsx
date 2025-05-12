
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to check if user is admin with better error handling
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log("Checking admin status for user:", userId);
      
      // Ensure we have a valid session before making the request
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.warn("No active session when checking admin status");
        return false;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error checking admin status:", error);
        setAdminCheckError(error.message);
        return false;
      }
      
      const isUserAdmin = data?.role === 'ADMIN';
      console.log("User admin status:", isUserAdmin);
      setIsAdmin(isUserAdmin);
      setAdminCheckError(null);
      return isUserAdmin;
    } catch (error: any) {
      console.error("Exception in checkAdminStatus:", error);
      setAdminCheckError(error.message);
      return false;
    }
  };

  // Login with email and password
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log("Attempting to log in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.session && data.user) {
        console.log("Login successful:", data.user);
        setSession(data.session);
        setUser(data.user);
        
        // Check if user is admin
        const adminStatus = await checkAdminStatus(data.user.id);
        console.log("Admin status after login:", adminStatus);
        
        // Handle redirection after role check
        if (adminStatus) {
          toast.success("Successfully logged in as Administrator!");
          navigate('/admin/dashboard');
        } else {
          toast.success("Successfully logged in!");
          navigate('/dashboard');
        }
        
        return { isAdmin: adminStatus };
      }
      
      return { isAdmin: false };
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast.error(error.message || "Failed to login");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Setup auth listener and initial session check
  useEffect(() => {
    setLoading(true);

    // Function to handle redirections based on user role
    const handleRoleBasedRedirection = async (userId: string) => {
      try {
        const isUserAdmin = await checkAdminStatus(userId);
        const currentPath = window.location.pathname;
        
        // Redirect admin users trying to access regular dashboard to admin dashboard
        if (isUserAdmin && currentPath === '/dashboard') {
          console.log("Admin user detected on regular dashboard, redirecting to admin dashboard");
          navigate('/admin/dashboard', { replace: true });
        }
        
        // Redirect regular users trying to access admin dashboard to regular dashboard
        if (!isUserAdmin && currentPath.startsWith('/admin/dashboard')) {
          console.log("Regular user detected on admin dashboard, redirecting to regular dashboard");
          toast.error("You don't have permission to access the admin dashboard");
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Error during role-based redirection:", error);
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.email);
      
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        navigate('/');
        toast.success("Successfully signed out");
      } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle admin check with retry mechanism
        if (session?.user) {
          let success = false;
          let attempts = 0;
          
          // Try up to 3 times with increasing delays
          while (!success && attempts < 3) {
            try {
              attempts++;
              const adminStatus = await checkAdminStatus(session.user.id);
              success = true;
              
              // Handle OAuth sign-in redirects (Google, etc.)
              if (_event === 'SIGNED_IN') {
                toast.success("Successfully signed in!");
                
                // Redirect based on admin status with a short delay to ensure state updates
                setTimeout(() => {
                  if (adminStatus) {
                    navigate('/admin/dashboard', { replace: true });
                  } else {
                    navigate('/dashboard', { replace: true });
                  }
                }, 300);
              }
            } catch (error) {
              console.warn(`Admin check attempt ${attempts} failed, retrying...`);
              if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, attempts * 1000));
              }
            }
          }
        }

        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Perform role-based redirection after setting user
          await handleRoleBasedRedirection(session.user.id);
        }
      } catch (error: any) {
        console.error('Error getting session:', error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear(); // Clear all local storage on sign out
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message);
    }
  };

  return { 
    user, 
    session, 
    loading, 
    signOut, 
    isAdmin, 
    adminCheckError,
    loginWithCredentials 
  };
};
