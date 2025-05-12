
import React from 'react';

/**
 * Examples of security measures
 * - RLS policies
 * - Input validation
 * - Authentication guards
 */

// Row Level Security (RLS) policies example
export const RLSPoliciesExample = `
-- Example RLS policy for bookings
CREATE POLICY "Users can view their own bookings"
ON bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON bookings
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  )
);

-- Only the booking owner or an admin can update a booking
CREATE POLICY "Users can update their own bookings"
ON bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only admins can delete bookings
CREATE POLICY "Only admins can delete bookings"
ON bookings
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  )
);
`;

// Input validation example using zod
export const InputValidationExample = `
import { z } from 'zod';

// Form validation schema for booking
const bookingSchema = z.object({
  preferred_date: z.date().min(
    new Date(Date.now() + 24 * 60 * 60 * 1000), 
    "Booking must be at least 24 hours in advance"
  ),
  number_of_people: z.number().int().positive().min(1).max(100),
  contact_name: z.string().min(2, "Name is too short").max(100),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().regex(
    /^\\+?[0-9]{10,15}$/, 
    "Invalid phone number format"
  ),
  special_requests: z.string().max(500).optional()
});

// Example function to validate data
const validateBookingData = (data) => {
  try {
    const validData = bookingSchema.parse(data);
    return { valid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, curr) => {
        const path = curr.path.join('.');
        acc[path] = curr.message;
        return acc;
      }, {});
      
      return { valid: false, errors: formattedErrors };
    }
    
    return { valid: false, errors: { _form: "Validation failed" } };
  }
};
`;

// Authentication guard for protected routes
export const AuthGuardExample = `
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Hook for authentication
import { useAuth } from '@/hooks/useAuth';

// Authentication guard component
const ProtectedRoute = ({ 
  redirectPath = '/auth?mode=signin',
  requiredRole
}) => {
  const { user, isLoading, profile } = useAuth();
  
  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Check role if required
  if (requiredRole && (!profile || profile.role !== requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

// Example usage in routes configuration
const AppRoutes = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    
    <Route element={<ProtectedRoute requiredRole="admin" />}>
      <Route path="/admin/*" element={<AdminPanel />} />
    </Route>
  </Routes>
);
`;

// CSRF protection
export const CSRFProtectionExample = `
// Helper function to set CSRF token in headers for all API requests
import axios from 'axios';

// Configure axios to include CSRF token in headers
const setupCSRFProtection = () => {
  // Get CSRF token from meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  if (csrfToken) {
    // Add to default headers for all requests
    axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
  }
};

// Call this function when the app initializes
setupCSRFProtection();

// For Supabase client, can add custom headers
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          'X-CSRF-Token': csrfToken || '',
        },
      },
    }
  );
};

export const supabase = getSupabaseClient();
`;

// XSS prevention
export const XSSPreventionExample = `
// Example of sanitizing user input before rendering
import DOMPurify from 'dompurify';

const UserComment = ({ comment }) => {
  // Sanitize HTML content
  const sanitizedComment = DOMPurify.sanitize(comment);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedComment }} />
  );
};

// Alternative: Don't use dangerouslySetInnerHTML at all
const SaferUserComment = ({ comment }) => {
  return <div className="comment-text">{comment}</div>;
};

// Always use content security policy headers on the server
// Example header:
// Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com;
`;
