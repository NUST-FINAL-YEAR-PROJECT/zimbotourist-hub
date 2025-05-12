
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
              if (_event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
                toast.success("Successfully signed in!");
                
                // Redirect based on admin status with a short delay to ensure state updates
                setTimeout(() => {
                  if (adminStatus) {
                    navigate('/admin/dashboard');
                  } else {
                    navigate('/dashboard');
                  }
                }, 500);
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
          
          // Check if user is admin with retry logic
          let success = false;
          let attempts = 0;
          
          while (!success && attempts < 3) {
            try {
              attempts++;
              await checkAdminStatus(session.user.id);
              success = true;
              
              // Handle route redirections
              const currentPath = window.location.pathname;
              
              // If we're on the dashboard route and user is admin, redirect to admin dashboard
              if (currentPath === '/dashboard' && isAdmin) {
                navigate('/admin/dashboard');
              }
              
              // If we're on the admin dashboard route and user is not admin, redirect to user dashboard
              if (currentPath.startsWith('/admin/dashboard') && !isAdmin) {
                toast.error("You don't have permission to access the admin dashboard");
                navigate('/dashboard');
              }
            } catch (error) {
              console.warn(`Initial admin check attempt ${attempts} failed, retrying...`);
              if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, attempts * 1000));
              }
            }
          }
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
  }, [navigate, isAdmin]);

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
