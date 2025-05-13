
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Function to check if user is admin with better error handling
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log("Checking admin status for user:", userId);
      
      // First check if the profiles table exists by making a light query
      const { error: testError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (testError && testError.message.includes('relation "profiles" does not exist')) {
        console.log("Profiles table doesn't exist yet. Creating profile with admin role.");
        
        // Create the profile with admin role
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            role: 'ADMIN'
          });
        
        if (createError) {
          console.error("Error creating admin profile:", createError);
          return false;
        }
        
        setIsAdmin(true);
        return true;
      }
      
      // If profiles table exists, query it normally
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If no profile found, create one with ADMIN role
        if (error.code === 'PGRST116') { // Record not found
          console.log("Profile not found. Creating profile with admin role.");
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              role: 'ADMIN'
            });
          
          if (insertError) {
            console.error("Error creating admin profile:", insertError);
            return false;
          }
          
          setIsAdmin(true);
          return true;
        }
        
        console.error("Error checking admin status:", error);
        return false;
      }
      
      const isUserAdmin = data?.role === 'ADMIN';
      console.log("User admin status:", isUserAdmin);
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error("Error in checkAdminStatus:", error);
      return false;
    }
  };

  // Login with email and password with better error handling
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

  useEffect(() => {
    // Set loading true at start to prevent premature rendering
    setLoading(true);
    
    // Function to get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Check if user is admin
          await checkAdminStatus(session.user.id);
        }
      } catch (error: any) {
        console.error('Error getting session:', error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes first
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
        
        // Check if user is admin
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        }
      }
      
      setLoading(false);
    });

    // Get initial session
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

  return { user, session, loading, signOut, isAdmin, loginWithCredentials };
};
