
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { useIsMobile } from "@/hooks/useIsMobile";
import { ChatBubble } from "./chat/ChatBubble";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatInput } from "./chat/ChatInput";

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
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Scroll to bottom when messages change
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
          id: `assistant-${uuidv4()}`,
          role: 'assistant',
          content: "Hello! I'm your Zimbabwe travel assistant. How can I help you with your travel plans today?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    setError(null);

    try {
      setIsLoading(true);
      
      // Create user message
      const userMessage: Message = {
        id: `user-${uuidv4()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      // Add user message to chat
      setMessages(prev => [...prev, userMessage]);
      
      // Prepare conversation history
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

      // Process the response for links and images
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
        'safari': '/dashboard/destinations',
        'great zimbabwe': '/dashboard/destinations',
        'matobo hills': '/dashboard/destinations',
        'eastern highlands': '/dashboard/destinations',
        'lake kariba': '/dashboard/destinations'
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
      
      // Fetch a relevant image based on content
      try {
        if (assistantContent.toLowerCase().includes("victoria falls")) {
          const { data: destinations } = await supabase
            .from("destinations")
            .select("image_url")
            .ilike("name", "%victoria falls%")
            .limit(1);
            
          if (destinations && destinations.length > 0) {
            image = destinations[0].image_url;
          }
        } else if (assistantContent.toLowerCase().includes("hwange")) {
          const { data: destinations } = await supabase
            .from("destinations")
            .select("image_url")
            .ilike("name", "%hwange%")
            .limit(1);
            
          if (destinations && destinations.length > 0) {
            image = destinations[0].image_url;
          }
        }
      } catch (e) {
        console.error("Error fetching destination image:", e);
      }
      
      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${uuidv4()}`,
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

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-accent text-white z-50 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-100 dark:bg-gray-950 dark:border-gray-800 z-50"
          >
            <ChatHeader onClose={() => setIsOpen(false)} />

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    links={msg.links}
                    image={msg.image}
                  />
                ))}
                
                {isLoading && (
                  <ChatBubble
                    role="assistant"
                    content=""
                    isLoading={true}
                  />
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

            <ChatInput
              isLoading={isLoading}
              onSend={sendMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
