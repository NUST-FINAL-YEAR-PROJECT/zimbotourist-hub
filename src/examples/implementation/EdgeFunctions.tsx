
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Example of using Supabase Edge Functions
 * - Chat completion
 * - Payment processing
 */

export const useChatCompletion = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const generateChatResponse = async (message, conversationHistory = []) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          message,
          conversationHistory,
        },
      });
      
      if (error) throw new Error(error.message);
      return data.response;
    } catch (err) {
      setError(err.message);
      toast.error(`Chat error: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateChatResponse,
    isLoading,
    error,
  };
};

// Paynow payment example
export const usePaynowPayment = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const createPayment = async (amount, reference, email) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-paynow-payment', {
        body: {
          amount,
          reference,
          email,
        },
      });
      
      if (error) throw new Error(error.message);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment');
      }
      
      return {
        redirectUrl: data.redirectUrl,
        pollUrl: data.pollUrl,
      };
    } catch (err) {
      toast.error(`Payment error: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkPaymentStatus = async (pollUrl) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-paynow-status', {
        body: {
          pollUrl,
        },
      });
      
      if (error) throw new Error(error.message);
      return data.status;
    } catch (err) {
      toast.error(`Payment status check error: ${err.message}`);
      throw err;
    }
  };
  
  return {
    createPayment,
    checkPaymentStatus,
    isLoading,
  };
};

// Example component
export const PaymentForm = () => {
  const [amount, setAmount] = React.useState(100);
  const [email, setEmail] = React.useState('');
  const { createPayment, isLoading } = usePaynowPayment();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const reference = `payment-${Date.now()}`;
      const { redirectUrl } = await createPayment(amount, reference, email);
      
      // Redirect to payment gateway
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Payment creation failed:', err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};
