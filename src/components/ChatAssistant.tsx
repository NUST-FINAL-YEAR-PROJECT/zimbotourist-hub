
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChatWindow } from "./chat/ChatWindow";

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
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return;
      }

      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          navigate('/auth');
        } else {
          setUser(session.user);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initAuth();

    const handleToggleChat = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleChatAssistant', handleToggleChat);

    return () => {
      window.removeEventListener('toggleChatAssistant', handleToggleChat);
    };
  }, [navigate]);

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
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast.error("Failed to start conversation");
      return null;
    }
  };

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      
      if (!conversation) {
        const newConversation = await createNewConversation();
        if (!newConversation) return;
        setConversation(newConversation);
      }

      const { error: userMessageError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: conversation.id,
          role: 'user' as const,
          content: message
        }]);

      if (userMessageError) throw userMessageError;

      const { data: aiResponse, error: functionError } = await supabase.functions
        .invoke('chat-completion', {
          body: { message },
        });

      if (functionError || !aiResponse) {
        const errorMessage = aiResponse?.error || functionError?.message || 'Failed to get AI response';
        throw new Error(errorMessage);
      }

      const { error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: conversation.id,
          role: 'assistant' as const,
          content: aiResponse.response
        }]);

      if (aiMessageError) throw aiMessageError;

      const { data: messages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setConversation(prev => prev ? {
        ...prev,
        messages: messages.map(msg => ({
          ...msg,
          role: msg.role as 'user' | 'assistant'
        }))
      } : null);
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-white"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            messages={conversation?.messages || []}
            isLoading={isLoading}
            onSendMessage={sendMessage}
          />
        )}
      </AnimatePresence>
    </>
  );
};
