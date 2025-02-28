
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const eventId = formData.get('eventId')

    if (!file || !eventId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or event ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Sanitize the file name (remove non-ASCII characters)
    const sanitizedFileName = (file as File).name.replace(/[^\x00-\x7F]/g, '');
    const fileExt = sanitizedFileName.split('.').pop();
    const fileNameWithoutExt = sanitizedFileName.split('.').slice(0, -1).join('.');
    
    // Generate a unique file path
    const filePath = `event-programs/${eventId}/${crypto.randomUUID()}.${fileExt}`

    // Upload file to storage
    const { data, error: uploadError } = await supabase.storage
      .from('events')
      .upload(filePath, file, {
        contentType: (file as File).type,
        upsert: false
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get the public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from('events')
      .getPublicUrl(filePath)

    // Update event with the program file information
    const { error: updateError } = await supabase
      .from('events')
      .update({
        program_url: publicUrlData.publicUrl,
        program_name: sanitizedFileName,
        program_type: (file as File).type
      })
      .eq('id', eventId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update event', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Program uploaded successfully', 
        program_url: publicUrlData.publicUrl,
        program_name: sanitizedFileName,
        program_type: (file as File).type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
