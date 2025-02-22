
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          console.log("Initial session loaded:", initialSession);
        }
      } catch (error: any) {
        console.error('Error getting initial session:', error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log("Auth state changed:", _event, currentSession);
      
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        navigate('/auth');
        toast.success("Successfully signed out");
      } else if (_event === 'SIGNED_IN') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        navigate('/dashboard');
        toast.success("Successfully signed in");
      } else if (_event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        console.log("Token refreshed successfully");
      } else if (_event === 'USER_UPDATED') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
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
      localStorage.clear();
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast.error(error.message);
    }
  };

  return { user, session, loading, signOut };
};
