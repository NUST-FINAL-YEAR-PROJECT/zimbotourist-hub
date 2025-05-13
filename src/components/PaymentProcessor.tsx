
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { processPayment, PaymentProvider, PaymentDetails } from "@/services/payment";
import { cn } from "@/lib/utils";

export interface PaymentProcessorProps {
  bookingId: string;
  amount: number;
  email: string;
  phone: string;
  itemName: string;
  description?: string;
  onPaymentComplete?: () => void;
  onPaymentCancel?: () => void;
  className?: string;
  paymentProviders?: PaymentProvider[];
}

/**
 * A standalone payment processor component that can be used throughout the application
 * to process payments using different providers.
 */
export const PaymentProcessor = ({
  bookingId,
  amount,
  email,
  phone,
  itemName,
  description,
  onPaymentComplete,
  onPaymentCancel,
  className,
  paymentProviders = ["paynow", "stripe"]
}: PaymentProcessorProps) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(paymentProviders[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    
    try {
      const paymentDetails: PaymentDetails = {
        amount,
        reference: bookingId,
        email,
        phone,
        items: [{ name: itemName, amount }],
        description,
        returnUrl: `${window.location.origin}/payment-status`,
      };
      
      const result = await processPayment(selectedProvider, paymentDetails);
      
      if (result.redirectUrl) {
        // Store poll URL in session storage if available
        if (selectedProvider === "paynow" && 'pollUrl' in result && result.pollUrl) {
          sessionStorage.setItem(`payment_${bookingId}_pollUrl`, result.pollUrl);
        }
        
        // Redirect to the payment page or provider's payment page
        window.location.href = result.redirectUrl;
      } else if (selectedProvider === "stripe" && 'clientSecret' in result && result.clientSecret) {
        // Navigate to the Stripe payment page
        navigate(`/dashboard/payment?booking_id=${bookingId}`);
      } else {
        throw new Error("No redirect URL or client secret provided");
      }
      
      toast({
        title: "Payment Initiated",
        description: "You are being redirected to complete your payment",
        className: "bg-green-50 border-green-200",
      });
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancel = () => {
    if (onPaymentCancel) {
      onPaymentCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment summary */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Booking Reference</span>
            <span className="text-sm text-muted-foreground">{bookingId.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Item</span>
            <span className="text-sm text-muted-foreground">{itemName}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-semibold">Total Amount</span>
            <span className="font-semibold text-primary">${amount}</span>
          </div>
        </div>
        
        {/* Payment provider selection */}
        {paymentProviders.length > 1 && (
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <RadioGroup
              value={selectedProvider}
              onValueChange={(value) => setSelectedProvider(value as PaymentProvider)}
              className="grid grid-cols-2 gap-4"
            >
              {paymentProviders.includes("paynow") && (
                <div className={cn(
                  "flex items-center space-x-2 rounded-md border p-4 cursor-pointer",
                  selectedProvider === "paynow" && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="paynow" id="paynow" />
                  <Label htmlFor="paynow" className="cursor-pointer flex-1">Paynow</Label>
                </div>
              )}
              
              {paymentProviders.includes("stripe") && (
                <div className={cn(
                  "flex items-center space-x-2 rounded-md border p-4 cursor-pointer",
                  selectedProvider === "stripe" && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="cursor-pointer flex-1">Credit Card</Label>
                </div>
              )}
            </RadioGroup>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handlePaymentSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
