
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const { to, subject, body, html, attachments } = await req.json();

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get("GMAIL_EMAIL_USER") || "",
          password: Deno.env.get("GMAIL_APP_PASSWORD") || "",
        },
      },
    });

    // Validate required fields
    if (!to || !subject || (!body && !html)) {
      throw new Error("Missing required email fields: to, subject, and either body or html content");
    }

    console.log("Sending email to:", to);

    const emailOptions = {
      from: Deno.env.get("GMAIL_EMAIL_USER") || "",
      to,
      subject,
      content: body || "",
      html: html || undefined,
      attachments: attachments || [],
    };

    await client.send(emailOptions);
    await client.close();

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
