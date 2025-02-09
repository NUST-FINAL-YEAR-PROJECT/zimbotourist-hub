
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

    const systemPrompt = `You are an expert Zimbabwe travel advisor. Your goal is to provide personalized travel recommendations based on the user's preferences and travel history. Focus on authentic experiences, local culture, and unique attractions. Format your response in a very specific JSON structure with these exact keys: destinations (array of strings), activities (array of strings), and tips (array of strings).`;

    const userPrompt = `Based on these preferences: ${JSON.stringify(preferences)} and travel history: ${JSON.stringify(travelHistory)}, provide personalized travel recommendations for Zimbabwe. Include must-visit destinations, suggested activities, best time to visit, and local insights.`;

    console.log('Making OpenAI API request...');
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
    console.log('OpenAI API response:', data);
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    let recommendations;
    try {
      // Try to parse the response as JSON
      const content = data.choices[0].message.content;
      console.log('Attempting to parse content:', content);
      recommendations = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', e);
      // Provide a fallback with the expected structure
      recommendations = {
        destinations: ['Victoria Falls', 'Hwange National Park', 'Great Zimbabwe'],
        activities: ['Wildlife viewing', 'Cultural tours', 'Adventure sports'],
        tips: ['Best time to visit is during dry season', 'Book accommodations in advance', 'Carry cash for local markets']
      };
    }

    // Ensure the response has the expected structure
    const validatedRecommendations = {
      destinations: Array.isArray(recommendations.destinations) ? recommendations.destinations : [],
      activities: Array.isArray(recommendations.activities) ? recommendations.activities : [],
      tips: Array.isArray(recommendations.tips) ? recommendations.tips : []
    };

    return new Response(
      JSON.stringify(validatedRecommendations),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    // Return a fallback response with the correct structure
    return new Response(
      JSON.stringify({
        destinations: ['Victoria Falls', 'Hwange National Park', 'Great Zimbabwe'],
        activities: ['Wildlife viewing', 'Cultural tours', 'Adventure sports'],
        tips: ['Best time to visit is during dry season', 'Book accommodations in advance', 'Carry cash for local markets']
      }), 
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
