
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          navigate('/dashboard');
          console.log("Initial session loaded:", initialSession);
        } else {
          navigate('/auth');
        }
      } catch (error: any) {
        console.error('Error getting initial session:', error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        navigate('/auth');
        toast.success("Successfully signed out");
      } else if (event === 'SIGNED_IN' && currentSession) {
        navigate('/dashboard');
        toast.success("Successfully signed in");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      localStorage.clear();
      navigate('/auth');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast.error(error.message);
    }
  };

  return { user, session, loading, signOut };
};
