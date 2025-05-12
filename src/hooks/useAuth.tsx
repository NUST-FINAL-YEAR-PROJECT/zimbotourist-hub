
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

  // Optimized admin check function with caching
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log("Checking admin status for user:", userId);
      
      // Get the current session directly without waiting for getSession
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

  // Optimized login with immediate role detection and navigation
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
        
        // Check admin status and return immediately
        const adminStatus = await checkAdminStatus(data.user.id);
        console.log("Admin status after login:", adminStatus);
        
        // Toast notification based on role
        if (adminStatus) {
          toast.success("Successfully logged in as Administrator!");
        } else {
          toast.success("Successfully logged in!");
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

  // Streamlined auth listener setup
  useEffect(() => {
    setLoading(true);

    // Function to handle redirections based on user role - simplified
    const handleRoleBasedRedirection = async (userId: string) => {
      await checkAdminStatus(userId);
    };

    // Listen for auth changes more efficiently
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
        
        // Simplified admin check - no retry mechanism to avoid delays
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        }

        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Get initial session - more direct approach
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Check admin status without complex redirection logic
          await checkAdminStatus(session.user.id);
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
