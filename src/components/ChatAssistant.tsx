
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, ExternalLink, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useUpcomingEvents } from "@/hooks/useEvents";
import type { Database } from "@/integrations/supabase/types";

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
  const location = useLocation();
  const { data: upcomingEvents } = useUpcomingEvents(3);
  const [error, setError] = useState<string | null>(null);

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
          content: "Hello! I'm your Zimbabwe travel assistant. How can I help you with your travel plans or answer any general questions you might have?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setError(null);

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
      
      // Prepare conversation history (excluding welcome message if it's the only message)
      const conversationHistory = messages
        .filter((msg, index) => index > 0 || messages.length === 1)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      console.log('Sending message to chat-completion function:', {
        message: userMessage.content,
        conversationHistoryLength: conversationHistory.length
      });
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { 
          message: userMessage.content,
          conversationHistory
        }
      });
      
      if (error) {
        console.error('Error from chat-completion function:', error);
        throw new Error(error.message || 'Failed to get response from the chat assistant');
      }

      if (!data || !data.response) {
        console.error('Invalid response from chat-completion function:', data);
        throw new Error('Invalid response from the chat assistant');
      }

      // Extract links and images if present in the response
      let assistantContent = data.response;
      const links: { text: string, url: string }[] = [];
      let image: string | null = null;

      // Check for tourism-related keywords to offer relevant navigation links
      const tourismKeywords = {
        'destinations': '/dashboard/destinations',
        'accommodations': '/dashboard/accommodations',
        'events': '/dashboard/events',
        'bookings': '/dashboard/bookings',
        'victoria falls': '/dashboard/destinations',
        'hwange': '/dashboard/destinations',
        'safari': '/dashboard/destinations'
      };
      
      // Check content for tourism keywords and add relevant links
      Object.entries(tourismKeywords).forEach(([keyword, url]) => {
        if (assistantContent.toLowerCase().includes(keyword.toLowerCase())) {
          const linkText = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          
          // Check if we don't already have a similar link
          const linkExists = links.some(link => 
            link.url === url && 
            (link.text.toLowerCase().includes(keyword.toLowerCase()) || 
             keyword.toLowerCase().includes(link.text.toLowerCase()))
          );
          
          if (!linkExists) {
            links.push({
              text: `Browse ${linkText}`,
              url: url
            });
          }
        }
      });
      
      // Try to fetch a relevant image based on content if it mentions specific destinations
      if (assistantContent.toLowerCase().includes("victoria falls")) {
        try {
          const { data: destinations } = await supabase
            .from("destinations")
            .select("image_url")
            .ilike("name", "%victoria falls%")
            .limit(1);
            
          if (destinations && destinations.length > 0) {
            image = destinations[0].image_url;
          }
        } catch (e) {
          console.error("Error fetching destination image:", e);
        }
      } else if (assistantContent.toLowerCase().includes("hwange")) {
        try {
          const { data: destinations } = await supabase
            .from("destinations")
            .select("image_url")
            .ilike("name", "%hwange%")
            .limit(1);
            
          if (destinations && destinations.length > 0) {
            image = destinations[0].image_url;
          }
        } catch (e) {
          console.error("Error fetching destination image:", e);
        }
      }
      
      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        links: links.length > 0 ? links : undefined,
        image: image
      };
      
      // Add assistant message to chat
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong with the chat');
      toast.error("Chat assistant error: " + (error instanceof Error ? error.message : 'Something went wrong'));
    } finally {
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-white z-50"
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
            className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-100 dark:bg-gray-950 dark:border-gray-800 z-50"
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
                              alt="Travel destination" 
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
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
                {error && (
                  <div className="flex justify-center">
                    <div className="max-w-[90%] rounded-lg px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm">
                      Error: {error}. Please try again.
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
                  placeholder="Ask me anything..."
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
