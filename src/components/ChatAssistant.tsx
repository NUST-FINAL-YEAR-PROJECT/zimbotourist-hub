
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Sample responses for common questions about Zimbabwe travel
const CANNED_RESPONSES: Record<string, string> = {
  "hello": "Hello! I'm your Zimbabwe travel assistant. How can I help you today?",
  "hi": "Hi there! I'm your Zimbabwe travel assistant. How can I help you plan your Zimbabwe adventure?",
  "help": "I can help you with information about Zimbabwe's attractions, accommodations, travel tips, and more. What would you like to know?",
  "victoria falls": "Victoria Falls is one of Zimbabwe's most famous attractions. Known locally as 'Mosi-oa-Tunya' (The Smoke That Thunders), it's one of the largest waterfalls in the world. The best time to visit is from February to May when the water volume is high.",
  "safari": "Zimbabwe offers excellent safari experiences in parks like Hwange National Park, Mana Pools, and Gonarezhou. You can see elephants, lions, leopards, rhinos, and buffalos (the Big Five) along with many other species.",
  "best time to visit": "The best time to visit Zimbabwe is during the dry season (May to October) when wildlife viewing is optimal as animals gather around water sources. However, if you want to see Victoria Falls at its most impressive, visit between February and May.",
  "currency": "Zimbabwe uses multiple currencies including the US Dollar and the Zimbabwe RTGS Dollar. US Dollars are widely accepted at most tourist establishments.",
  "visa": "Most visitors need a visa to enter Zimbabwe. You can obtain it on arrival at major entry points, but it's advisable to check the latest requirements before traveling.",
  "safety": "Zimbabwe is generally considered safe for tourists, especially in major tourist areas. As with any destination, it's advisable to take normal precautions and stay informed about local conditions.",
  "accommodations": "Zimbabwe offers a range of accommodations from luxury safari lodges to budget-friendly hostels. Major tourist destinations like Victoria Falls and Harare have the most options.",
  "harare": "Harare is Zimbabwe's capital and largest city. It offers attractions like the National Gallery, Harare Gardens, and vibrant markets. It's also a good starting point for trips to other parts of the country.",
  "food": "Traditional Zimbabwean cuisine includes sadza (a thick maize porridge) served with various stews and relishes. Don't miss trying local dishes like nyama (grilled meat) and bota (porridge with peanut butter).",
  "transportation": "Getting around Zimbabwe can be done by domestic flights, buses, or car rentals. For longer distances, flying is recommended, while buses are good for shorter journeys. Self-driving is possible but challenging on some rural roads.",
  "weather": "Zimbabwe has a moderate climate. The rainy season is from November to March, and the dry season is from April to October. Temperatures are generally warm year-round, with higher elevations being cooler."
};

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (userMessage: string) => {
    // Convert message to lowercase and trim for better matching
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Check for keyword matches in our canned responses
    for (const [keyword, response] of Object.entries(CANNED_RESPONSES)) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        return response;
      }
    }
    
    // Default response if no keywords match
    return "I'm sorry, I don't have specific information about that. As a simple travel assistant, I can provide basic information about Zimbabwe's major attractions, accommodations, and travel tips. Could you try asking about another topic?";
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
      
      // Simulate response delay
      setTimeout(() => {
        const response = generateResponse(userMessage.content);
        
        // Create assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        // Add assistant message to chat
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Something went wrong with the chat. Please try again.");
      setIsLoading(false);
    }
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
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Ask me anything about traveling in Zimbabwe!</p>
                  </div>
                )}
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
                      {msg.content}
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
                  placeholder="Type your message..."
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
