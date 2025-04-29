
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          const userIsAdmin = profileData?.role === 'ADMIN';
          setIsAdmin(userIsAdmin);
          console.log("User admin status:", userIsAdmin);
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
        
        if (_event === 'SIGNED_IN') {
          // Check if user is admin after sign in
          if (session?.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
              
            const userIsAdmin = profileData?.role === 'ADMIN';
            setIsAdmin(userIsAdmin);
            console.log("User signed in as admin:", userIsAdmin);
            
            // Show splash screen and let it handle the navigation
            setShowSplash(true);
            toast.success("Successfully signed in");
          }
        }
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

  return { user, session, loading, signOut, showSplash, setShowSplash, isAdmin };
};
