
import React from 'react';

/**
 * Examples of challenges faced during implementation and their solutions
 */

export const ChallengesAndSolutions = () => {
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Payment Integration Challenges</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Challenge</h3>
            <p className="text-red-600">
              Initial integration with Paynow faced issues with callback handling. 
              The payment confirmation webhook was unreliable due to network timeouts 
              and sometimes failed to update the booking status correctly.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Solution</h3>
            <p className="text-green-600">
              Implemented a polling mechanism as a fallback to verify payment status.
              The client-side application now stores the payment poll URL and periodically
              checks the payment status using an edge function. This ensures that even if
              the webhook fails, the payment status is still correctly updated.
            </p>
            
            <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap">
{`// Client-side payment status polling
const pollPaymentStatus = async (pollUrl, maxAttempts = 10) => {
  let attempts = 0;
  
  const checkStatus = async () => {
    attempts++;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-paynow-status', {
        body: { pollUrl }
      });
      
      if (error) throw new Error(error.message);
      
      // If payment completed or failed, update booking
      if (data.status === 'paid' || data.status === 'awaiting delivery') {
        await updateBookingStatus('confirmed');
        return true;
      } else if (data.status === 'cancelled' || data.status === 'failed') {
        await updateBookingStatus('payment_failed');
        return true;
      }
      
      // If still pending and under max attempts, try again
      if (attempts < maxAttempts) {
        // Wait 5 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 5000));
        return checkStatus();
      } else {
        // Max attempts reached, mark as pending for manual verification
        await updateBookingStatus('pending_verification');
        return false;
      }
    } catch (err) {
      console.error('Payment status check failed:', err);
      return false;
    }
  };
  
  return checkStatus();
};`}
              </pre>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">AI Chat Performance</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Challenge</h3>
            <p className="text-red-600">
              The AI assistant had slow response times initially, often taking 
              5-10 seconds to respond. This created a poor user experience, especially
              for simple queries that should have been answered quickly.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Solution</h3>
            <p className="text-green-600">
              Implemented several optimizations:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-green-600">
              <li>Added caching for common queries to avoid redundant API calls</li>
              <li>Optimized prompt construction to reduce token count</li>
              <li>Switched from GPT-4 to GPT-4o-mini for faster response times</li>
              <li>Implemented streaming responses for a better user experience</li>
            </ul>
            
            <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap">
{`// Caching layer for common queries
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const queryCache = new Map();

const getCachedResponse = async (key) => {
  const cached = queryCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('Cache hit for query:', key);
    return cached.response;
  }
  return null;
};

const setCachedResponse = (key, response) => {
  queryCache.set(key, {
    response,
    timestamp: Date.now()
  });
};

// Process chat message with caching
const processChatMessage = async (message, conversationHistory) => {
  // For simple FAQ queries, check the cache first
  if (conversationHistory.length <= 1) {
    const cacheKey = message.toLowerCase().trim();
    const cachedResponse = await getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // Call OpenAI for response
  const aiResponse = await callOpenAI(message, conversationHistory);
  
  // Cache the response if it's a simple query
  if (conversationHistory.length <= 1) {
    setCachedResponse(message.toLowerCase().trim(), aiResponse);
  }
  
  return aiResponse;
};`}
              </pre>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Mobile Responsiveness</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Challenge</h3>
            <p className="text-red-600">
              The booking form was difficult to use on mobile devices. The form was
              too long and complex, requiring users to scroll excessively and they
              often missed important fields.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Solution</h3>
            <p className="text-green-600">
              Redesigned the booking form with a step-based approach to improve the
              mobile user experience. The form was split into logical sections, with
              each step focusing on specific information:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-2 text-green-600">
              <li>Travel dates and number of people</li>
              <li>Contact information</li>
              <li>Special requirements and preferences</li>
              <li>Payment details</li>
            </ol>
            
            <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap">
{`// Step-based form component
const BookingForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    travel_date: '',
    number_of_people: 1,
    // Contact info
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    // Requirements
    special_requests: '',
    dietary_requirements: '',
    // Payment (handled separately)
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Travel Details</h3>
            
            <div className="form-group">
              <label>Travel Date</label>
              <DatePicker
                name="travel_date"
                value={formData.travel_date}
                onChange={(date) => setFormData(prev => ({ ...prev, travel_date: date }))}
              />
            </div>
            
            <div className="form-group">
              <label>Number of People</label>
              <Input
                name="number_of_people"
                type="number"
                min="1"
                value={formData.number_of_people}
                onChange={handleChange}
              />
            </div>
            
            <Button onClick={nextStep}>Continue</Button>
          </div>
        );
      
      case 2:
        // Contact information step
        // ...
      
      case 3:
        // Special requirements step
        // ...
      
      case 4:
        // Payment step
        // ...
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="flex mb-6">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={\`flex-1 h-2 mx-1 rounded-full \${
              i <= step ? 'bg-primary' : 'bg-gray-200'
            }\`}
          />
        ))}
      </div>
      
      {renderStep()}
    </div>
  );
};`}
              </pre>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">State Management Complexity</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Challenge</h3>
            <p className="text-red-600">
              As the application grew, state management became complex, with multiple
              components needing access to shared data like user preferences, booking
              details, and UI state. This led to prop drilling and difficult-to-maintain
              code.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Solution</h3>
            <p className="text-green-600">
              Refactored to use React Query for server state and custom hooks to isolate
              logic. This approach provided:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-green-600">
              <li>Automatic caching and revalidation</li>
              <li>Separation of concerns between UI and data fetching</li>
              <li>Reduced boilerplate code</li>
              <li>Improved performance through optimized re-renders</li>
            </ul>
            
            <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap">
{`// Before: Component with inline data fetching and state
const DestinationsList = () => {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('destinations').select('*');
        if (error) throw error;
        setDestinations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDestinations();
  }, []);
  
  // Rest of component...
};

// After: Using React Query and custom hooks
// In a custom hook file:
export const useDestinations = (filters) => {
  return useQuery({
    queryKey: ['destinations', filters],
    queryFn: async () => {
      let query = supabase.from('destinations').select('*');
      
      // Apply filters...
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

// In the component:
const DestinationsList = ({ filters }) => {
  const { data: destinations, isLoading, error } = useDestinations(filters);
  
  // Much cleaner component with separated concerns
  // ...
};`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChallengesAndSolutions;
