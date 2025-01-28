import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("architecture");

  const handleDownload = (imageName: string) => {
    const link = document.createElement("a");
    link.href = `/${imageName}.png`;
    link.download = `${imageName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">System Documentation</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="architecture">System Architecture</TabsTrigger>
          <TabsTrigger value="sequence">Sequence Diagram</TabsTrigger>
          <TabsTrigger value="er">ER Diagram</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">System Architecture</h2>
              <Button onClick={() => handleDownload("architecture")}>
                <Download className="mr-2 h-4 w-4" />
                Download Diagram
              </Button>
            </div>
            <img 
              src="/architecture.png" 
              alt="System Architecture" 
              className="max-w-2xl mx-auto mb-4"
            />
            <div className="prose max-w-none">
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Sequence Diagram</h2>
              <Button onClick={() => handleDownload("sequence")}>
                <Download className="mr-2 h-4 w-4" />
                Download Diagram
              </Button>
            </div>
            <img 
              src="/sequence.png" 
              alt="Sequence Diagram" 
              className="max-w-2xl mx-auto mb-4"
            />
            <div className="prose max-w-none">
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">ER Diagram</h2>
              <Button onClick={() => handleDownload("er")}>
                <Download className="mr-2 h-4 w-4" />
                Download Diagram
              </Button>
            </div>
            <img 
              src="/er.png" 
              alt="ER Diagram" 
              className="max-w-2xl mx-auto mb-4"
            />
            <div className="prose max-w-none">
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
      </Tabs>
    </div>
  );
};

export default Documentation;