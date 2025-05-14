
// This file handles the client-side integration with Paynow payment gateway

export const createPayment = async (
  email: string,
  phone: string, 
  amount: number,
  reference: string,
  items: { name: string, amount: number }[] = []
) => {
  try {
    const { data, error } = await (window as any).supabase.functions.invoke(
      'create-paynow-payment',
      {
        body: {
          email,
          phone,
          amount,
          reference,
          items,
          returnUrl: `${window.location.origin}/payment-status`,
        }
      }
    );

    if (error) {
      console.error('Paynow payment creation error:', error);
      throw new Error(error.message || 'Failed to create payment');
    }

    console.log('Paynow payment response:', data);
    return data;
  } catch (error: any) {
    console.error('Paynow client error:', error);
    return { 
      success: false, 
      error: error.message || 'Payment processing failed' 
    };
  }
};

export const checkPaymentStatus = async (pollUrl: string) => {
  try {
    const { data, error } = await (window as any).supabase.functions.invoke(
      'check-paynow-status',
      {
        body: { pollUrl }
      }
    );

    if (error) throw new Error(error.message || 'Failed to check payment status');
    return data;
  } catch (error: any) {
    console.error('Check payment status error:', error);
    return { 
      paid: false, 
      error: error.message || 'Failed to verify payment status' 
    };
  }
};
