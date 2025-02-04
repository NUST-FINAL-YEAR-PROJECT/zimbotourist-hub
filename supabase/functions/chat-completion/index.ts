
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured. Please contact the administrator.' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { message } = await req.json();
    console.log('Received message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable Zimbabwe travel assistant. Provide helpful, concise information about destinations, activities, accommodations, and travel tips in Zimbabwe. Keep responses friendly and informative.'
          },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response status:', response.status);
    console.log('OpenAI API response:', data);

    if (!response.ok) {
      let errorMessage = 'Failed to get AI response';
      
      if (data.error?.code === 'insufficient_quota') {
        errorMessage = 'The AI service is currently unavailable due to quota limits. Please try again later or contact support.';
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-completion function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again later.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
