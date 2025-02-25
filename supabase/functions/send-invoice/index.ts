
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
    const {
      destination,
      numberOfPeople,
      date,
      contactDetails,
      status,
      invoiceNumber,
      paymentDue,
    } = await req.json();

    console.log('Received invoice data:', {
      destination,
      numberOfPeople,
      date,
      contactDetails,
      status,
      invoiceNumber,
      paymentDue,
    });

    // Generate simple invoice HTML
    const invoiceHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">TravelApp Invoice</h1>
          <div style="margin: 20px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 20px;">
            <p><strong>Zimbabwe Travel Hub</strong><br>
            123 Samora Machel Avenue<br>
            Harare, Zimbabwe<br>
            Phone: +263 242 123456<br>
            Email: contact@zimbabwetravelhub.com</p>
          </div>
          <div style="margin: 20px 0;">
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div style="margin: 20px 0;">
            <h2>Booking Details</h2>
            <p><strong>Destination:</strong> ${destination.name}</p>
            <p><strong>Number of People:</strong> ${numberOfPeople}</p>
            <p><strong>Travel Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> $${(destination.price * numberOfPeople).toFixed(2)}</p>
          </div>
          <div style="margin: 20px 0; background-color: #F9FAFB; padding: 20px; border-radius: 4px;">
            <p style="margin: 0; color: #374151;">Payment is due by ${new Date(paymentDue).toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Zimbabwe Travel Hub <onboarding@resend.dev>',
      to: [contactDetails.email],
      subject: `Invoice #${invoiceNumber} for your Zimbabwe Travel Booking`,
      html: invoiceHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-invoice function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
