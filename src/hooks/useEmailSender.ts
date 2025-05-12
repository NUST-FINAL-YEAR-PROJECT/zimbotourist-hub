
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailPayload {
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded content
    encoding?: string;
    contentType?: string;
  }>;
}

export function useEmailSender() {
  const [isSending, setIsSending] = useState(false);
  
  const sendEmail = async (emailData: EmailPayload) => {
    setIsSending(true);
    
    try {
      // Check for required fields
      if (!emailData.to || !emailData.subject || (!emailData.body && !emailData.html)) {
        throw new Error("Missing required email fields");
      }

      const { data, error } = await supabase.functions.invoke("send-gmail", {
        body: emailData,
      });

      if (error) {
        console.error("Error sending email:", error);
        toast.error(`Failed to send email: ${error.message || "Unknown error"}`);
        return false;
      }

      toast.success("Email sent successfully!");
      return true;
    } catch (error: any) {
      console.error("Error in sendEmail:", error);
      toast.error(`Failed to send email: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendEmail,
    isSending,
  };
}
