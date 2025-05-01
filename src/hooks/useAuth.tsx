
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // Always set to true for admin bypass
  const navigate = useNavigate();

  // Function to check if user is admin - simplified to always return true for our bypass
  const checkAdminStatus = async (userId: string) => {
    console.log("Admin bypass enabled - always returns true");
    setIsAdmin(true);
    return true;
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
        
        // Always set admin to true for bypass
        setIsAdmin(true);
        
        toast.success("Successfully logged in as Administrator!");
        console.log("User is admin, will redirect to admin dashboard");
        navigate('/admin/dashboard');
        
        return { isAdmin: true };
      }
      
      return { isAdmin: true };
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast.error(error.message || "Failed to login");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          
          // Always set admin to true
          setIsAdmin(true);
        }
      } catch (error: any) {
        console.error('Error getting session:', error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
      
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        navigate('/');
        toast.success("Successfully signed out");
      } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Always set admin to true for bypass
        setIsAdmin(true);
      }
      
      setLoading(false);
    });

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

  return { user, session, loading, signOut, isAdmin, loginWithCredentials };
};
