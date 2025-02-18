
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import * as ReactPDF from "npm:@react-pdf/renderer@3.1.14";
import { BookingInvoice } from "./_components/BookingInvoice.tsx";
import React from "npm:react@18.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  destination: any;
  numberOfPeople: number;
  date: string;
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  invoiceNumber: string;
  paymentDue: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: EmailData = await req.json();
    
    // Generate PDF
    const pdfBuffer = await ReactPDF.renderToBuffer(
      React.createElement(BookingInvoice, {
        ...data,
        date: new Date(data.date),
        paymentDue: new Date(data.paymentDue),
      })
    );

    // Send email with PDF attachment
    const { data: emailData, error } = await resend.emails.send({
      from: 'TravelApp <onboarding@resend.dev>',
      to: [data.contactDetails.email],
      subject: `Your Travel Booking Invoice #${data.invoiceNumber}`,
      html: `
        <h1>Thank you for your booking!</h1>
        <p>Dear ${data.contactDetails.name},</p>
        <p>Please find attached your booking invoice for ${data.destination.name}.</p>
        <p>Invoice Number: ${data.invoiceNumber}</p>
        <p>Total Amount: $${(data.destination.price * data.numberOfPeople).toFixed(2)}</p>
        <p>Due Date: ${new Date(data.paymentDue).toLocaleDateString()}</p>
        <br>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>TravelApp Team</p>
      `,
      attachments: [
        {
          filename: `invoice-${data.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
