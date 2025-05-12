
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Example of Paynow payment integration
 */

export const PaymentIntegrationExample = () => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const reference = `payment-${Date.now()}`;
      
      // Call the Edge Function to create payment
      const { data, error } = await supabase.functions.invoke('create-paynow-payment', {
        body: { email, amount, reference }
      });

      if (error) throw new Error(error.message);
      
      if (!data.success) {
        throw new Error(data.error || 'Payment creation failed');
      }

      // Save the payment details in the database
      await supabase.from('payments').insert({
        reference,
        amount,
        email,
        status: 'pending',
        poll_url: data.pollUrl
      });

      // Store the poll URL in session storage for checking status later
      sessionStorage.setItem('payment_poll_url', data.pollUrl);
      sessionStorage.setItem('payment_reference', reference);

      // Redirect to Paynow
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Make Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
      </form>
    </div>
  );
};

/**
 * Payment status checking component
 */
export const PaymentStatusChecker = () => {
  const [status, setStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const checkPaymentStatus = async () => {
    const pollUrl = sessionStorage.getItem('payment_poll_url');
    if (!pollUrl) {
      setError('No payment in progress');
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-paynow-status', {
        body: { pollUrl }
      });

      if (error) throw new Error(error.message);
      
      setStatus(data.status);
      
      if (data.status === 'paid' || data.status === 'awaiting delivery') {
        const reference = sessionStorage.getItem('payment_reference');
        
        // Update payment status in database
        await supabase.from('payments').update({
          status: 'completed',
        }).eq('reference', reference);
        
        toast.success('Payment successful!');
      } else if (data.status === 'cancelled') {
        toast.error('Payment was cancelled');
      }
    } catch (err) {
      console.error('Failed to check payment status:', err);
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Payment Status</h2>
      
      {status ? (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p>Status: <span className="font-semibold">{status}</span></p>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">Click below to check your payment status</p>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <Button 
        onClick={checkPaymentStatus} 
        disabled={isChecking}
        className="w-full"
      >
        {isChecking ? 'Checking...' : 'Check Payment Status'}
      </Button>
    </div>
  );
};
