
import React from 'react';

/**
 * Examples of testing methodologies
 * - Unit testing
 * - Integration testing
 * - E2E testing
 */

// Unit test example for Button component (Jest + React Testing Library)
export const ButtonUnitTestExample = `
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct variant class', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
`;

// Integration test example (Jest + React Testing Library + MSW)
export const BookingIntegrationTestExample = `
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BookingForm } from './BookingForm';

// Mock server to intercept API calls
const server = setupServer(
  // Mock destination data fetch
  rest.get('https://gduzxexxpbibimtiycur.supabase.co/rest/v1/destinations', (req, res, ctx) => {
    return res(
      ctx.json([
        { 
          id: 'dest123', 
          name: 'Victoria Falls', 
          price: 100,
          location: 'Livingstone',
          description: 'One of the seven natural wonders of the world'
        }
      ])
    );
  }),
  
  // Mock booking creation
  rest.post('https://gduzxexxpbibimtiycur.supabase.co/rest/v1/bookings', (req, res, ctx) => {
    return res(
      ctx.json({ id: 'booking123' })
    );
  })
);

// Start server before tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('complete booking flow', async () => {
  const queryClient = new QueryClient();
  
  // Render component
  render(
    <QueryClientProvider client={queryClient}>
      <BookingForm destinationId="dest123" />
    </QueryClientProvider>
  );
  
  // Wait for destination data to load
  await waitFor(() => {
    expect(screen.getByText('Victoria Falls')).toBeInTheDocument();
  });
  
  // Fill booking form
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: 'John Doe' }
  });
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'john@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText(/phone/i), {
    target: { value: '+1234567890' }
  });
  
  fireEvent.change(screen.getByLabelText(/number of people/i), {
    target: { value: '2' }
  });
  
  // Submit form
  fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }));
  
  // Verify success message
  await waitFor(() => {
    expect(screen.getByText(/booking successful/i)).toBeInTheDocument();
  });
});
`;

// E2E test example (Cypress)
export const CypressE2ETestExample = `
describe('User Authentication', () => {
  it('allows users to sign up and login', () => {
    // Visit the signup page
    cy.visit('/auth?mode=signup');
    
    // Fill in signup form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('securePassword123');
    cy.get('input[name="confirmPassword"]').type('securePassword123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Log out
    cy.get('[data-testid="logout-button"]').click();
    
    // Log back in
    cy.visit('/auth?mode=signin');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('securePassword123');
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-greeting"]').should('contain', 'Welcome');
  });
  
  it('displays error message for invalid credentials', () => {
    cy.visit('/auth?mode=signin');
    
    // Try with invalid email format
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verify error message
    cy.get('[data-testid="form-error"]').should('be.visible');
    
    // Try with valid email but wrong password
    cy.get('input[name="email"]').clear().type('test@example.com');
    cy.get('input[name="password"]').clear().type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verify error message
    cy.get('[data-testid="auth-error"]').should('be.visible');
  });
});

describe('Booking Flow', () => {
  beforeEach(() => {
    // Log in before each test
    cy.login('test@example.com', 'securePassword123');
  });
  
  it('allows user to book a destination', () => {
    // Visit destinations page
    cy.visit('/destinations');
    
    // Click on a destination
    cy.get('[data-testid="destination-card"]').first().click();
    
    // Click on "Book Now"
    cy.get('button').contains('Book Now').click();
    
    // Fill booking form
    cy.get('input[name="contactName"]').type('John Doe');
    cy.get('input[name="contactEmail"]').type('john@example.com');
    cy.get('input[name="contactPhone"]').type('+1234567890');
    cy.get('input[name="numberOfPeople"]').clear().type('2');
    
    // Select a date (assuming datepicker)
    cy.get('[data-testid="date-picker"]').click();
    cy.get('.rdp-day').not('.rdp-day_disabled').first().click();
    
    // Submit booking
    cy.get('button').contains('Confirm Booking').click();
    
    // Verify redirect to payment
    cy.url().should('include', '/payment');
    
    // Verify booking details on payment page
    cy.get('[data-testid="booking-summary"]').should('be.visible');
    cy.get('[data-testid="total-amount"]').should('be.visible');
  });
});
`;

// Performance optimization example
export const PerformanceOptimizationExample = `
// Code splitting example
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DestinationsPage = lazy(() => import('./pages/DestinationsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));

// App component with code splitting
const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/destinations/*" element={<DestinationsPage />} />
        <Route path="/events/*" element={<EventsPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
      </Routes>
    </Suspense>
  );
};

// Memoization example
import { useMemo, useCallback } from 'react';

const DestinationFiltering = ({ destinations, filters }) => {
  const filteredDestinations = useMemo(() => {
    return destinations.filter(dest => 
      dest.price >= filters.minPrice && 
      dest.price <= filters.maxPrice &&
      (!filters.region || dest.region === filters.region)
    );
  }, [destinations, filters.minPrice, filters.maxPrice, filters.region]);
  
  const handleFilter = useCallback((newFilters) => {
    // Handle filtering logic
  }, []);
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

// Image optimization
const OptimizedImage = ({ src, alt, sizes }) => {
  return (
    <img 
      src={src} 
      alt={alt}
      loading="lazy"
      className="w-full h-auto object-cover"
      srcSet={\`\${src}?width=400 400w, 
               \${src}?width=800 800w, 
               \${src}?width=1200 1200w\`}
      sizes={sizes || "(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"}
    />
  );
};`;
