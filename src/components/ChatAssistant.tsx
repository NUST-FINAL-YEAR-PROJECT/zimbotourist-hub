
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string | null;
  messages: Message[];
}

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!user) return;

      try {
        // Try to find an existing conversation
        const { data: existingConversations, error: conversationError } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (conversationError) {
          console.error('Error fetching conversation:', conversationError);
          return;
        }

        if (existingConversations && existingConversations.length > 0) {
          const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', existingConversations[0].id)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return;
          }

          setConversation({
            ...existingConversations[0],
            messages: messages?.map(msg => ({
              id: msg.id,
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              created_at: msg.created_at
            })) || []
          });
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error("Failed to load conversation history");
      }
    };

    loadConversation();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const createNewConversation = async () => {
    try {
      if (!user) {
        toast.error("Please sign in to use the chat assistant");
        return null;
      }

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([{ user_id: user.id, title: 'New Conversation' }])
        .select()
        .single();

      if (error) throw error;
      return { ...data, messages: [] };
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error("Failed to start conversation");
      return null;
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      
      let currentConversation = conversation;
      if (!currentConversation) {
        currentConversation = await createNewConversation();
        if (!currentConversation) {
          setIsLoading(false);
          return;
        }
        setConversation(currentConversation);
      }

      // Add user message to the UI immediately for better UX
      const userMessageObj = {
        id: `temp-${Date.now()}`,
        role: 'user' as const,
        content: message,
        created_at: new Date().toISOString()
      };
      
      setConversation(prev => 
        prev ? { 
          ...prev, 
          messages: [...prev.messages, userMessageObj]
        } : null
      );

      // Insert user message to the database
      const { data: userMessageData, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: currentConversation.id,
          role: 'user' as const,
          content: message
        }])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Get AI response
      const { data, error: functionError } = await supabase.functions.invoke('chat-completion', {
        body: { message, conversationId: currentConversation.id }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to get AI response');
      }

      // Insert AI response to the database
      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: currentConversation.id,
          role: 'assistant' as const,
          content: data.response
        }])
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;

      // Fetch updated messages
      const { data: messages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', currentConversation.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setConversation(prev => 
        prev ? { 
          ...prev, 
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            created_at: msg.created_at
          }))
        } : null
      );
      
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

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

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {!conversation?.messages?.length && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Ask me anything about traveling in Zimbabwe!</p>
                  </div>
                )}
                {conversation?.messages?.map((msg) => (
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
