
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check if user is admin
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      const isUserAdmin = data?.role === 'ADMIN';
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  // Login with email and password
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        
        const adminStatus = await checkAdminStatus(data.user.id);
        
        // Store a session flag to redirect after refresh
        sessionStorage.setItem('authenticated', 'true');
        
        return { isAdmin: adminStatus };
      }
      
      return { isAdmin: false };
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      return { isAdmin: false };
    }
  };

  useEffect(() => {
    // Function to get initial session
    const getInitialSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('authenticated');
        navigate('/');
        toast.success("Successfully signed out");
      } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
          sessionStorage.setItem('authenticated', 'true');
        }
      }
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
      localStorage.clear();
      sessionStorage.removeItem('authenticated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return { user, session, isLoading, signOut, isAdmin, loginWithCredentials };
};
