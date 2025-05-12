import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Code } from "lucide-react";
import { SwaggerUI } from "@/components/ui/swagger-ui";
import { supabase } from "@/integrations/supabase/client";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("architecture");

  const { data: apiDocs = [] } = useQuery({
    queryKey: ["api-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_docs")
        .select("*")
        .order("endpoint_path");

      if (error) throw error;
      return data;
    }
  });

  const DiagramDisplay = ({ src, alt, fallbackText }: { src: string; alt: string; fallbackText: string }) => {
    return (
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full h-auto mx-auto"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden p-8 text-center text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-4" />
          <p>{fallbackText}</p>
        </div>
      </div>
    );
  };

  const CodeBlock = ({ code, language = "typescript" }: { code: string; language?: string }) => {
    return (
      <div className="relative bg-gray-900 rounded-md overflow-hidden mb-4">
        <div className="p-1 bg-gray-800 text-xs text-gray-400 border-b border-gray-700">
          {language}
        </div>
        <pre className="p-4 overflow-x-auto text-gray-300 text-sm">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">System Documentation</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="architecture">System Architecture</TabsTrigger>
          <TabsTrigger value="sequence">Sequence Diagram</TabsTrigger>
          <TabsTrigger value="er">ER Diagram</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="api-docs">API Documentation</TabsTrigger>
          <TabsTrigger value="implementation">Implementation & Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">System Architecture</h2>
            <DiagramDisplay 
              src="/architecture.png" 
              alt="System Architecture"
              fallbackText="System architecture diagram will be displayed here"
            />
            <div className="prose max-w-none mt-6">
              <h3>Frontend Technologies</h3>
              <ul>
                <li>React with TypeScript</li>
                <li>Vite for build tooling</li>
                <li>Tailwind CSS for styling</li>
                <li>Shadcn UI components</li>
                <li>React Query for data fetching</li>
              </ul>

              <h3>Backend Services (Supabase)</h3>
              <ul>
                <li>PostgreSQL Database</li>
                <li>Authentication & Authorization</li>
                <li>Storage for media files</li>
                <li>Row Level Security (RLS)</li>
                <li>Edge Functions</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sequence" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Sequence Diagram</h2>
            <DiagramDisplay 
              src="/sequence.png" 
              alt="Sequence Diagram"
              fallbackText="Sequence diagram will be displayed here"
            />
            <div className="prose max-w-none mt-6">
              <h3>Key User Flows</h3>
              <ol>
                <li>User Authentication Flow</li>
                <li>Destination Booking Process</li>
                <li>Review Submission</li>
                <li>Payment Processing</li>
              </ol>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="er" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">ER Diagram</h2>
            <DiagramDisplay 
              src="/er.png" 
              alt="ER Diagram"
              fallbackText="ER diagram will be displayed here"
            />
            <div className="prose max-w-none mt-6">
              <h3>Database Tables</h3>
              <ul>
                <li>Profiles</li>
                <li>Destinations</li>
                <li>Events</li>
                <li>Bookings</li>
                <li>Reviews</li>
                <li>Payments</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
            <div className="prose max-w-none">
              <h3>Authentication</h3>
              <ul>
                <li><code>POST /auth/signup</code> - Create new user account</li>
                <li><code>POST /auth/signin</code> - User login</li>
                <li><code>POST /auth/signout</code> - User logout</li>
              </ul>

              <h3>Destinations</h3>
              <ul>
                <li><code>GET /destinations</code> - List all destinations</li>
                <li><code>GET /destinations/:id</code> - Get destination details</li>
                <li><code>POST /destinations</code> - Create new destination (Admin)</li>
                <li><code>PUT /destinations/:id</code> - Update destination (Admin)</li>
                <li><code>DELETE /destinations/:id</code> - Delete destination (Admin)</li>
              </ul>

              <h3>Bookings</h3>
              <ul>
                <li><code>GET /bookings</code> - List user's bookings</li>
                <li><code>POST /bookings</code> - Create new booking</li>
                <li><code>PUT /bookings/:id</code> - Update booking status</li>
                <li><code>DELETE /bookings/:id</code> - Cancel booking</li>
              </ul>

              <h3>Reviews</h3>
              <ul>
                <li><code>GET /reviews</code> - List all reviews</li>
                <li><code>POST /reviews</code> - Create new review</li>
                <li><code>PUT /reviews/:id</code> - Update review</li>
                <li><code>DELETE /reviews/:id</code> - Delete review</li>
              </ul>

              <h3>Payments</h3>
              <ul>
                <li><code>POST /payments</code> - Create payment</li>
                <li><code>GET /payments/:id</code> - Get payment status</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api-docs" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
            <SwaggerUI endpoints={apiDocs} />
          </div>
        </TabsContent>
        
        <TabsContent value="implementation" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">CHAPTER FIVE: IMPLEMENTATION AND TESTING</h2>
            
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mt-8 mb-4">5.1 Frontend Implementation</h3>
              
              <h4 className="text-lg font-medium mt-6 mb-3">5.1.1 React Component Architecture</h4>
              <p>
                The Zimbabwe Travel Assistant application follows a component-based architecture using
                React with TypeScript. Components are organized into logical groups:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>UI components (buttons, inputs, cards)</li>
                <li>Layout components (containers, sections)</li>
                <li>Feature-specific components (destinations, bookings, chat)</li>
                <li>Page components (routes)</li>
              </ul>
              
              <p className="mb-4">Example of a reusable button component with multiple variants:</p>
              <CodeBlock code={`// Button component with variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground shadow hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        amber: "bg-amber-500 text-black shadow-md hover:bg-amber-400",
        gradient: "bg-gradient-to-br from-primary to-accent text-white shadow-md hover:opacity-90",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9 p-0",
        "2xl": "h-12 rounded-md px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)`} />
              
              <h4 className="text-lg font-medium mt-6 mb-3">5.1.2 State Management</h4>
              <p className="mb-4">
                The application uses React Query for server-state management and local state for UI-specific state.
                Custom hooks encapsulate business logic and data fetching:
              </p>
              
              <CodeBlock code={`// Example of a custom hook for fetching destinations
export const useDestinations = (filters?: DestinationFilters) => {
  return useQuery({
    queryKey: ["destinations", filters],
    queryFn: async () => {
      let query = supabase.from("destinations").select("*");
      
      if (filters?.region) {
        query = query.eq("region", filters.region);
      }
      
      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice);
      }
      
      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });
};`} />

              <h3 className="text-xl font-semibold mt-8 mb-4">5.2 Backend Implementation</h3>
              
              <h4 className="text-lg font-medium mt-6 mb-3">5.2.1 Supabase Integration</h4>
              <p className="mb-4">
                The application uses Supabase for backend services including database, authentication,
                storage, and edge functions. The Supabase client is initialized as follows:
              </p>
              
              <CodeBlock code={`import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gduzxexxpbibimtiycur.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: localStorage
  }
});`} />
              
              <h4 className="text-lg font-medium mt-6 mb-3">5.2.2 Edge Functions</h4>
              <p className="mb-4">
                Supabase Edge Functions are used to implement server-side logic, such as
                payment processing and AI chat assistance. Example of the chat completion function:
              </p>
              
              <CodeBlock code={`// chat-completion edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    const configuration = new Configuration({ apiKey: Deno.env.get("OPENAI_API_KEY") });
    const openai = new OpenAIApi(configuration);
    
    // Prepare the messages array for the API
    const messages = [
      { role: "system", content: "You are a helpful Zimbabwe travel assistant..." },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
    });

    const response = completion.data.choices[0].message.content;
    
    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})`} />

              <h3 className="text-xl font-semibold mt-8 mb-4">5.3 Payment Integration</h3>
              <p className="mb-4">
                The application integrates with Paynow for payment processing. The payment flow involves:
              </p>
              <ol className="list-decimal pl-6 my-4">
                <li>Creating a payment in the Paynow system via an edge function</li>
                <li>Redirecting the user to Paynow for payment</li>
                <li>Handling payment callbacks and verifying payment status</li>
              </ol>
              
              <CodeBlock code={`// create-paynow-payment edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Paynow from "npm:paynow";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, reference } = await req.json();
    
    const paynow = new Paynow(
      Deno.env.get("PAYNOW_INTEGRATION_ID") || "",
      Deno.env.get("PAYNOW_INTEGRATION_KEY") || ""
    );
    
    const payment = paynow.createPayment(reference, email);
    payment.add("Zimbabwe Travel Booking", amount);
    
    const response = await paynow.send(payment);
    
    if (response.success) {
      return new Response(
        JSON.stringify({
          success: true,
          redirectUrl: response.redirectUrl,
          pollUrl: response.pollUrl,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      throw new Error("Payment initiation failed");
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Payment processing failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})`} />

              <h3 className="text-xl font-semibold mt-8 mb-4">5.4 Testing Methodology</h3>
              
              <h4 className="text-lg font-medium mt-6 mb-3">5.4.1 Unit Testing</h4>
              <p className="mb-4">
                Unit tests were implemented using Jest and React Testing Library to test
                individual components and utilities:
              </p>
              
              <CodeBlock code={`// Example unit test for the Button component
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
});`} />
              
              <h4 className="text-lg font-medium mt-6 mb-3">5.4.2 Integration Testing</h4>
              <p className="mb-4">
                Integration tests were conducted to verify the interaction between components
                and services. Example of testing the booking flow:
              </p>
              
              <CodeBlock code={`// Example integration test for booking flow
test('complete booking flow', async () => {
  // Mock Supabase responses
  mockSupabaseClient.from.mockImplementation((table) => {
    if (table === 'destinations') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'dest123', name: 'Victoria Falls', price: 100 } 
        })
      };
    }
    if (table === 'bookings') {
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ 
          data: { id: 'booking123' } 
        })
      };
    }
  });
  
  // Mock Paynow response
  mockPaynowClient.createPayment.mockReturnValue({
    success: true,
    redirectUrl: 'https://paynow.co.zw/payment/123',
    pollUrl: 'https://paynow.co.zw/poll/123'
  });
  
  // Render booking component
  render(<BookingForm destination={{ id: 'dest123', name: 'Victoria Falls', price: 100 }} />);
  
  // Fill in booking details
  fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
  
  // Submit the booking
  fireEvent.click(screen.getByText('Confirm & Pay'));
  
  // Verify that the booking was created
  await waitFor(() => {
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('bookings');
    expect(mockPaynowClient.createPayment).toHaveBeenCalled();
  });
});`} />
              
              <h4 className="text-lg font-medium mt-6 mb-3">5.4.3 End-to-End Testing</h4>
              <p className="mb-4">
                End-to-end tests were implemented using Cypress to test critical user flows:
              </p>
              
              <CodeBlock code={`// Example Cypress E2E test
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
});`} />
              
              <h3 className="text-xl font-semibold mt-8 mb-4">5.5 Performance Optimization</h3>
              <p className="mb-4">
                Several performance optimization techniques were implemented:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>
                  <strong>Code Splitting:</strong> React.lazy and Suspense for component-level code splitting
                  <CodeBlock code={`const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard/*" element={<Dashboard />} />
        {/* Other routes */}
      </Routes>
    </React.Suspense>
  );
}`} />
                </li>
                <li>
                  <strong>Memoization:</strong> useMemo and useCallback to prevent unnecessary re-renders
                  <CodeBlock code={`const filteredDestinations = useMemo(() => {
  return destinations.filter(dest => 
    dest.price >= filters.minPrice && 
    dest.price <= filters.maxPrice
  );
}, [destinations, filters.minPrice, filters.maxPrice]);`} />
                </li>
                <li>
                  <strong>Image Optimization:</strong> Responsive images and lazy loading
                  <CodeBlock code={`<img 
  src={destination.image_url} 
  alt={destination.name}
  loading="lazy"
  className="w-full h-auto object-cover"
  srcSet={`${destination.image_url}?width=400 400w, 
           ${destination.image_url}?width=800 800w`}
  sizes="(max-width: 600px) 400px, 800px"
/>`} />
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-8 mb-4">5.6 Deployment</h3>
              <p className="mb-4">
                The application is deployed using a CI/CD pipeline that includes:
              </p>
              <ol className="list-decimal pl-6 my-4">
                <li>Automated testing on pull requests</li>
                <li>Building and bundling the frontend application</li>
                <li>Deploying edge functions to Supabase</li>
                <li>Deploying the frontend to a CDN</li>
                <li>Database migrations for schema changes</li>
              </ol>
              <p>
                The deployment process ensures that all tests pass before changes are deployed to production.
                Additionally, the application uses environment-specific configuration to handle
                different settings for development, staging, and production environments.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4">5.7 Security Measures</h3>
              <p className="mb-4">
                Security measures implemented in the application include:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>
                  <strong>Row Level Security (RLS):</strong> Supabase RLS policies to control database access
                  <CodeBlock code={`-- Example RLS policy for bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );`} />
                </li>
                <li>
                  <strong>Input Validation:</strong> Form validation to prevent injection attacks
                  <CodeBlock code={`// Form validation using zod schema
const bookingSchema = z.object({
  preferred_date: z.date().min(new Date(), "Date must be in the future"),
  number_of_people: z.number().int().positive().min(1).max(100),
  contact_name: z.string().min(2, "Name is too short").max(100),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
});`} />
                </li>
                <li>
                  <strong>Authentication:</strong> Secure authentication via Supabase Auth
                  <CodeBlock code={`// Protecting a route with authentication
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth?mode=signin');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : null;
};`} />
                </li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-8 mb-4">5.8 Challenges and Solutions</h3>
              <p className="mb-4">
                Several challenges were encountered during implementation and how they were addressed:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>
                  <strong>Payment Integration Challenges:</strong> Initial integration with Paynow faced issues with
                  callback handling. Implemented a polling mechanism as a fallback to verify payment status.
                </li>
                <li>
                  <strong>AI Chat Performance:</strong> The AI assistant had slow response times initially.
                  Implemented caching for common queries and optimized prompt construction to improve response times.
                </li>
                <li>
                  <strong>Mobile Responsiveness:</strong> The booking form was difficult to use on mobile.
                  Redesigned the form with a step-based approach to improve mobile user experience.
                </li>
                <li>
                  <strong>State Management Complexity:</strong> As the application grew, state management became complex.
                  Refactored to use React Query for server state and custom hooks to isolate logic.
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
