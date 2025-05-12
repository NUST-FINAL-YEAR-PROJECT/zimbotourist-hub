
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image } from "lucide-react";
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">System Documentation</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="architecture">System Architecture</TabsTrigger>
          <TabsTrigger value="sequence">Sequence Diagram</TabsTrigger>
          <TabsTrigger value="er">ER Diagram</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="api-docs">API Documentation</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Documentation;
