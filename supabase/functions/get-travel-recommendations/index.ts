
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
    const { preferences, travelHistory } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const systemPrompt = `You are an expert Zimbabwe travel advisor. Your goal is to provide personalized travel recommendations based on the user's preferences and travel history. Focus on authentic experiences, local culture, and unique attractions. Format your response in JSON with sections for recommended destinations, activities, and practical tips.`;

    const userPrompt = `Based on these preferences: ${JSON.stringify(preferences)} and travel history: ${JSON.stringify(travelHistory)}, provide personalized travel recommendations for Zimbabwe. Include must-visit destinations, suggested activities, best time to visit, and local insights.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    let recommendations;
    try {
      // Try to parse the response as JSON first
      recommendations = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If parsing fails, use the raw content with a basic structure
      recommendations = {
        destinations: ['Victoria Falls', 'Hwange National Park', 'Great Zimbabwe'],
        activities: ['Wildlife viewing', 'Cultural tours', 'Adventure sports'],
        tips: ['Best time to visit is during dry season', 'Book accommodations in advance', 'Carry cash for local markets']
      };
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: {
        destinations: ['Victoria Falls', 'Hwange National Park', 'Great Zimbabwe'],
        activities: ['Wildlife viewing', 'Cultural tours', 'Adventure sports'],
        tips: ['Best time to visit is during dry season', 'Book accommodations in advance', 'Carry cash for local markets']
      }
    }), {
      status: 200, // Return 200 even on error, with fallback data
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
