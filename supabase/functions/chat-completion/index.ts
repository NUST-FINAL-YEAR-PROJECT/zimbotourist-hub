
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, conversationHistory = [] } = await req.json();
    console.log('Received message:', message);
    console.log('Conversation history length:', conversationHistory.length);

    // Construct messages array with system prompt and conversation history
    const messages = [
      {
        role: 'system',
        content: `You are a friendly and conversational travel assistant for Zimbabwe tourism. 
        Engage naturally in conversations while providing helpful tourism information when relevant. 
        Your primary goal is to be helpful, personable, and informative about Zimbabwe's attractions, 
        culture, travel tips, and experiences. When the conversation moves to general topics, 
        maintain a warm and friendly tone, but find natural ways to relate topics back to 
        tourism in Zimbabwe when appropriate without being forceful.
        
        Be concise but thorough in your responses. If you don't know something specific about 
        Zimbabwe tourism, acknowledge it rather than providing incorrect information.`
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.map((msg: {role: string, content: string}) => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add the new user message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7, // Slightly higher temperature for more conversational responses
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to get response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('AI Response:', aiResponse);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-completion function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
