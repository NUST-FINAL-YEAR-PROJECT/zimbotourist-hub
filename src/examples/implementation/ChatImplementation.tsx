
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';

/**
 * Example of AI chat implementation using OpenAI
 */

// Message interface
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatComponent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: `assistant-${uuidv4()}`,
          role: 'assistant',
          content: "Hello! I'm your Zimbabwe travel assistant. How can I help you plan your trip today?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${uuidv4()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          message: userMessage.content,
          conversationHistory
        }
      });
      
      if (error) throw new Error(error.message || 'Failed to get response');
      
      if (!data || !data.response) {
        throw new Error('Invalid response from the assistant');
      }
      
      // Add assistant response
      setMessages(prev => [
        ...prev, 
        {
          id: `assistant-${uuidv4()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      // Add an error message
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-error-${uuidv4()}`,
          role: 'assistant',
          content: `I'm sorry, I encountered an error. Please try again later.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md border rounded-lg overflow-hidden bg-white shadow-md">
      {/* Chat Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-primary to-accent text-white">
        <h3 className="font-semibold">Zimbabwe Travel Assistant</h3>
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl p-3 bg-gray-100 text-gray-800">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <form 
          className="flex gap-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about Zimbabwe..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Example of the OpenAI Edge Function implementation
export const OpenAIEdgeFunctionExample = `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    // Construct messages array with system prompt and conversation history
    const messages = [
      {
        role: 'system',
        content: \`You are a friendly and conversational travel assistant for Zimbabwe tourism. 
        Engage naturally in conversations while providing helpful tourism information when relevant. 
        Your primary goal is to be helpful, personable, and informative about Zimbabwe's attractions, 
        culture, travel tips, and experiences. When the conversation moves to general topics, 
        maintain a warm and friendly tone, but find natural ways to relate topics back to 
        tourism in Zimbabwe when appropriate without being forceful.
        
        Be concise but thorough in your responses. If you don't know something specific about 
        Zimbabwe tourism, acknowledge it rather than providing incorrect information.
        
        Use a friendly, enthusiastic tone. Zimbabwe has amazing destinations like Victoria Falls,
        Hwange National Park, Great Zimbabwe, Matobo Hills, Eastern Highlands, and Lake Kariba.\`
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add the new user message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${OPENAI_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || \`Failed to get response from OpenAI: \${response.status}\`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
`;
