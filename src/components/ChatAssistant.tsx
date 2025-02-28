
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, ExternalLink, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  links?: { text: string; url: string }[];
  image?: string | null;
}

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: "Hello! I'm your Zimbabwe travel assistant. How can I help you with your travel plans? You can ask me about destinations, accommodations, activities, or travel tips.",
          timestamp: new Date()
        }
      ]);
    }
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    // Convert message to lowercase and trim for better matching
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Check for navigation requests
    if (normalizedMessage.includes("dashboard") || normalizedMessage.includes("home")) {
      return {
        content: "I can take you to the dashboard. Click the link below:",
        links: [{ text: "Go to Dashboard", url: "/dashboard" }]
      };
    }
    
    if (normalizedMessage.includes("destinations") || normalizedMessage.includes("places to visit")) {
      return {
        content: "Here's information about our destinations. You can also visit the destinations page:",
        links: [{ text: "Explore Destinations", url: "/dashboard/destinations" }]
      };
    }
    
    if (normalizedMessage.includes("accommodations") || normalizedMessage.includes("hotels") || normalizedMessage.includes("places to stay")) {
      return {
        content: "Looking for a place to stay? Check out our accommodations:",
        links: [{ text: "View Accommodations", url: "/dashboard/accommodations" }]
      };
    }
    
    if (normalizedMessage.includes("events") || normalizedMessage.includes("activities")) {
      return {
        content: "We have various events and activities. Check them out here:",
        links: [{ text: "Browse Events", url: "/dashboard/events" }]
      };
    }
    
    // Enhanced booking-related responses
    if (normalizedMessage.includes("bookings") || normalizedMessage.includes("my trips") || normalizedMessage.includes("my reservations")) {
      // Try to fetch some of the user's bookings
      try {
        const { data: userBookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id, 
            booking_date, 
            status, 
            payment_status,
            destinations (name),
            events (title)
          `)
          .limit(3)
          .order('created_at', { ascending: false });
        
        if (bookingsError) throw bookingsError;
        
        if (userBookings && userBookings.length > 0) {
          const bookingDetails = userBookings.map(booking => {
            const destinationOrEvent = booking.destinations?.name || booking.events?.title || "Unknown";
            const date = new Date(booking.booking_date).toLocaleDateString();
            return `- ${destinationOrEvent} (${date}): ${booking.status}`;
          }).join("\n");
          
          return {
            content: `Here are your recent bookings:\n\n${bookingDetails}\n\nYou can view all your bookings here:`,
            links: [{ text: "View All Bookings", url: "/dashboard/bookings" }]
          };
        } else {
          return {
            content: "You can view your bookings and manage reservations here:",
            links: [{ text: "View My Bookings", url: "/dashboard/bookings" }]
          };
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        return {
          content: "You can view your bookings here:",
          links: [{ text: "View My Bookings", url: "/dashboard/bookings" }]
        };
      }
    }

    // Handle booking status inquiries
    if (normalizedMessage.includes("booking status") || 
        normalizedMessage.includes("reservation status") || 
        normalizedMessage.match(/status of (my|the) booking/)) {
      try {
        const { data: latestBooking, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            id, 
            booking_date, 
            status, 
            payment_status,
            destinations (name),
            events (title)
          `)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (bookingError) throw bookingError;
        
        if (latestBooking && latestBooking.length > 0) {
          const booking = latestBooking[0];
          const destinationOrEvent = booking.destinations?.name || booking.events?.title || "Unknown";
          
          return {
            content: `Your latest booking for ${destinationOrEvent} is currently ${booking.status}. Payment status: ${booking.payment_status}.`,
            links: [{ text: "View Booking Details", url: "/dashboard/bookings" }]
          };
        } else {
          return {
            content: "I couldn't find any bookings associated with your account. Would you like to make a new booking?",
            links: [
              { text: "Browse Destinations", url: "/dashboard/destinations" },
              { text: "View Events", url: "/dashboard/events" }
            ]
          };
        }
      } catch (error) {
        console.error("Error fetching booking status:", error);
        return {
          content: "I'm having trouble retrieving your booking status. You can check your bookings directly here:",
          links: [{ text: "View My Bookings", url: "/dashboard/bookings" }]
        };
      }
    }
    
    // Handle cancellation queries
    if (normalizedMessage.includes("cancel") && 
        (normalizedMessage.includes("booking") || normalizedMessage.includes("reservation"))) {
      return {
        content: "You can cancel your bookings from the bookings page. Please note our cancellation policy: cancellations made at least 48 hours before the booking date are eligible for a full refund.",
        links: [{ text: "Manage Bookings", url: "/dashboard/bookings" }]
      };
    }
    
    // Handle payment queries
    if (normalizedMessage.includes("payment") || normalizedMessage.includes("pay for")) {
      try {
        const { data: pendingBookings, error: paymentError } = await supabase
          .from("bookings")
          .select(`
            id, 
            total_price,
            destinations (name),
            events (title)
          `)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (paymentError) throw paymentError;
        
        if (pendingBookings && pendingBookings.length > 0) {
          const pendingPayments = pendingBookings.map(booking => {
            const destinationOrEvent = booking.destinations?.name || booking.events?.title || "Unknown";
            return `- ${destinationOrEvent}: $${booking.total_price.toFixed(2)}`;
          }).join("\n");
          
          return {
            content: `You have the following pending payments:\n\n${pendingPayments}\n\nYou can complete your payments here:`,
            links: [{ text: "Complete Payments", url: "/dashboard/bookings" }]
          };
        } else {
          return {
            content: "You don't have any pending payments at the moment. You can view your booking payment history here:",
            links: [{ text: "View Bookings", url: "/dashboard/bookings" }]
          };
        }
      } catch (error) {
        console.error("Error fetching payment information:", error);
        return {
          content: "You can complete payments for your bookings here:",
          links: [{ text: "Manage Payments", url: "/dashboard/bookings" }]
        };
      }
    }
    
    // Check for specific destination or attraction queries
    if (normalizedMessage.includes("victoria falls") || normalizedMessage.includes("mosi-oa-tunya")) {
      // Search for Victoria Falls in the database
      const { data: destinations } = await supabase
        .from("destinations")
        .select("*")
        .ilike("name", "%victoria falls%")
        .limit(1);
      
      if (destinations && destinations.length > 0) {
        const destination = destinations[0];
        return {
          content: `Victoria Falls, known locally as 'Mosi-oa-Tunya' (The Smoke That Thunders), is one of the largest waterfalls in the world. Located on the Zambezi River, it forms the border between Zambia and Zimbabwe. The best time to visit is from February to May when the water volume is high.`,
          links: [{ text: "View Victoria Falls Details", url: `/destinations/${destination.id}` }],
          image: destination.image_url
        };
      }
    }
    
    if (normalizedMessage.includes("hwange") || normalizedMessage.includes("safari")) {
      // Search for Hwange in the database
      const { data: destinations } = await supabase
        .from("destinations")
        .select("*")
        .ilike("name", "%hwange%")
        .limit(1);
      
      if (destinations && destinations.length > 0) {
        const destination = destinations[0];
        return {
          content: `Hwange National Park is Zimbabwe's largest wildlife reserve and home to over 100 mammal species including the "Big Five" (lion, leopard, elephant, rhino, and buffalo). The best time for wildlife viewing is during the dry season (May to October) when animals gather around water sources.`,
          links: [{ text: "Explore Hwange National Park", url: `/destinations/${destination.id}` }],
          image: destination.image_url
        };
      }
    }
    
    // Generic destination search
    if (normalizedMessage.includes("where can i visit") || 
        normalizedMessage.match(/show me .*(places|destinations|attractions)/)) {
      const { data: topDestinations } = await supabase
        .from("destinations")
        .select("id, name, image_url")
        .limit(3);
      
      if (topDestinations && topDestinations.length > 0) {
        let content = "Here are some popular destinations in Zimbabwe:";
        const links = topDestinations.map(dest => ({
          text: dest.name,
          url: `/destinations/${dest.id}`
        }));
        
        return {
          content,
          links,
          image: topDestinations[0].image_url
        };
      }
    }
    
    // Handle accommodation queries
    if (normalizedMessage.match(/best (hotels|accommodations|places to stay)/)) {
      const { data: accommodations } = await supabase
        .from("accommodations")
        .select("id, name, image_url, price_per_night")
        .order("rating", { ascending: false })
        .limit(3);
      
      if (accommodations && accommodations.length > 0) {
        let content = "Here are some top-rated accommodations in Zimbabwe:";
        const links = accommodations.map(acc => ({
          text: `${acc.name} - $${acc.price_per_night}/night`,
          url: `/accommodations/${acc.id}`
        }));
        
        return {
          content,
          links,
          image: accommodations[0].image_url
        };
      }
    }
    
    // Handle general travel information queries
    if (normalizedMessage.includes("best time to visit")) {
      return {
        content: "The best time to visit Zimbabwe is during the dry season (May to October) when wildlife viewing is optimal as animals gather around water sources. However, if you want to see Victoria Falls at its most impressive, visit between February and May when water levels are highest."
      };
    }
    
    if (normalizedMessage.includes("currency") || normalizedMessage.includes("money")) {
      return {
        content: "Zimbabwe uses multiple currencies including the US Dollar and the Zimbabwe RTGS Dollar. US Dollars are widely accepted at most tourist establishments and are recommended for visitors."
      };
    }
    
    if (normalizedMessage.includes("visa") || normalizedMessage.includes("entry requirements")) {
      return {
        content: "Most visitors need a visa to enter Zimbabwe. You can obtain it on arrival at major entry points, but it's advisable to check the latest requirements before traveling. The cost ranges from $30 to $55 for single-entry visas depending on your nationality."
      };
    }
    
    if (normalizedMessage.includes("safety") || normalizedMessage.includes("safe to travel")) {
      return {
        content: "Zimbabwe is generally considered safe for tourists, especially in major tourist areas. As with any destination, it's advisable to take normal precautions and stay informed about local conditions. Tourist areas and national parks are well-maintained and secure."
      };
    }
    
    if (normalizedMessage.includes("food") || normalizedMessage.includes("eat")) {
      return {
        content: "Traditional Zimbabwean cuisine includes sadza (a thick maize porridge) served with various stews and relishes. Don't miss trying local dishes like nyama (grilled meat), bota (porridge with peanut butter), and dovi (peanut stew). Major tourist areas also offer international cuisine."
      };
    }
    
    if (normalizedMessage.includes("transportation") || normalizedMessage.includes("getting around")) {
      return {
        content: "Getting around Zimbabwe can be done by domestic flights, buses, or car rentals. For longer distances, flying is recommended, while buses are good for shorter journeys. Self-driving is possible but challenging on some rural roads. Within cities, taxis and ride-sharing services are available."
      };
    }
    
    if (normalizedMessage.includes("weather") || normalizedMessage.includes("climate")) {
      return {
        content: "Zimbabwe has a moderate climate. The rainy season is from November to March, and the dry season is from April to October. Temperatures are generally warm year-round, with higher elevations being cooler. Summer temperatures average 25-30°C (77-86°F), while winter temperatures range from 13-21°C (55-70°F)."
      };
    }
    
    // Search for general keywords in destinations
    const searchTerms = normalizedMessage.split(' ').filter(word => word.length > 3);
    if (searchTerms.length > 0) {
      for (const term of searchTerms) {
        const { data: matchingDestinations } = await supabase
          .from("destinations")
          .select("id, name, description, image_url")
          .or(`name.ilike.%${term}%, description.ilike.%${term}%`)
          .limit(2);
          
        if (matchingDestinations && matchingDestinations.length > 0) {
          const destination = matchingDestinations[0];
          const shortDescription = destination.description 
            ? destination.description.substring(0, 150) + (destination.description.length > 150 ? '...' : '')
            : 'No description available.';
            
          return {
            content: `I found information about ${destination.name}: ${shortDescription}`,
            links: [{ text: `Learn more about ${destination.name}`, url: `/destinations/${destination.id}` }],
            image: destination.image_url
          };
        }
      }
    }
    
    // Default response if no keywords match
    return {
      content: "I don't have specific information about that. As your travel assistant, I can provide information about Zimbabwe's major attractions, accommodations, travel tips, and recommendations. Would you like to know about popular destinations, best time to visit, or travel requirements?",
      links: [
        { text: "Browse Destinations", url: "/dashboard/destinations" },
        { text: "View Accommodations", url: "/dashboard/accommodations" },
        { text: "Explore Events", url: "/dashboard/events" }
      ]
    };
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      
      // Create user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      // Add user message to chat
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      
      // Get response from backend
      const response = await generateResponse(userMessage.content);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        links: response.links,
        image: response.image
      };
      
      // Add assistant message to chat
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Something went wrong with the chat. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLinkClick = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-white"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-100 dark:bg-gray-950 dark:border-gray-800"
          >
            <div className="p-4 border-b flex justify-between items-center bg-primary text-white">
              <h3 className="font-semibold">Zimbabwe Travel Assistant</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      <div className="space-y-2">
                        {msg.image && (
                          <div className="rounded-lg overflow-hidden mb-2">
                            <img 
                              src={msg.image} 
                              alt="Destination" 
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        <p>{msg.content}</p>
                        
                        {msg.links && msg.links.length > 0 && (
                          <div className="pt-2 space-y-1">
                            {msg.links.map((link, index) => (
                              <button
                                key={index}
                                onClick={() => handleLinkClick(link.url)}
                                className="flex items-center text-sm text-primary hover:underline w-full text-left"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {link.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about Zimbabwe travel..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
