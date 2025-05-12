
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Example of Supabase integration
 * - Authentication
 * - Database operations
 * - Storage functions
 */

// Authentication example
export const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });
    
    // Initial user check
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };
  
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  
  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
};

// Database operations example
export const useBookings = (userId) => {
  return {
    getBookings: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          destinations:destination_id (*),
          events:event_id (*)
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    createBooking: async (bookingData) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select();
      
      if (error) throw error;
      return data[0];
    },
  };
};

// Storage example
export const useStorage = () => {
  const uploadFile = async (file, bucket, path) => {
    const fileName = `${path}/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path);
      
    return publicUrl;
  };
  
  return {
    uploadFile,
  };
};
