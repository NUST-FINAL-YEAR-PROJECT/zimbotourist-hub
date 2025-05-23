import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/types/models";
import { Send } from "lucide-react";

Font.register({
  family: 'Helvetica',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QIFqPfE.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TYFqPfE.ttf',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
    fontFamily: 'Helvetica',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  logo: {
    fontSize: 24,
    marginBottom: 4,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 100,
    color: '#E5E7EB',
    opacity: 0.1,
    zIndex: -1,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    paddingBottom: 4,
    borderBottom: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    color: '#6B7280',
    flex: 1,
  },
  value: {
    color: '#111827',
    flex: 2,
  },
  total: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: 2,
    borderColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 10,
    borderTop: 1,
    borderColor: '#E5E7EB',
    paddingTop: 20,
  },
  note: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  noteText: {
    color: '#374151',
    fontSize: 11,
  },
  status: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
});

interface BookingInvoiceProps {
  destination: Destination;
  numberOfPeople: number;
  date: Date;
  contactDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  status?: 'pending' | 'confirmed' | 'cancelled';
  invoiceNumber?: string;
  paymentDue?: Date;
}

export const BookingInvoice = ({ 
  destination, 
  numberOfPeople, 
  date, 
  contactDetails,
  status = 'pending',
  invoiceNumber = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  paymentDue = addDays(new Date(), 7)
}: BookingInvoiceProps) => {
  const { toast } = useToast();
  const invoiceDate = format(new Date(), "MMMM d, yyyy");
  const bookingDate = format(date, "MMMM d, yyyy");
  const dueDate = format(paymentDue, "MMMM d, yyyy");
  const totalAmount = destination.price * numberOfPeople;

  const sendInvoiceByEmail = async () => {
    console.log('Sending invoice with data:', {
      destination,
      numberOfPeople,
      date,
      contactDetails,
      status,
      invoiceNumber,
      paymentDue
    });

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No authentication session found');
      }

      console.log('Making request to:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice`);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({
            destination,
            numberOfPeople,
            date: date.toISOString(),
            contactDetails,
            status,
            invoiceNumber,
            paymentDue: paymentDue.toISOString(),
          }),
        }
      );

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send invoice');
      }

      toast({
        title: "Invoice Sent",
        description: `The invoice has been sent to ${contactDetails?.email}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  return (
    <div className="flex flex-col space-y-4 h-full">
      {contactDetails && (
        <div className="flex justify-end px-4">
          <Button 
            onClick={sendInvoiceByEmail}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send Invoice to {contactDetails.email}
          </Button>
        </div>
      )}
      <div className="flex-1 min-h-[600px]">
        <PDFViewer className="w-full h-full">
          <Document
            title={`Invoice ${invoiceNumber}`}
            author="Zimbabwe Travel Hub"
            subject={`Travel Booking Invoice for ${destination.name}`}
            keywords="travel, booking, invoice, zimbabwe"
            creator="Zimbabwe Travel Hub Booking System"
          >
            <Page 
              size="A4" 
              style={styles.page}
              wrap={false}
            >
              {status === 'pending' && (
                <Text style={styles.watermark}>PENDING</Text>
              )}

              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.logo}>Zimbabwe Travel Hub</Text>
                  <Text style={styles.subtitle}>123 Samora Machel Avenue</Text>
                  <Text style={styles.subtitle}>Harare, Zimbabwe</Text>
                  <Text style={styles.subtitle}>+263 242 123456</Text>
                  <Text style={styles.subtitle}>contact@zimbabwetravelhub.com</Text>
                </View>
                <View style={styles.headerRight}>
                  <Text style={[
                    styles.status,
                    status === 'confirmed' && { backgroundColor: '#DCFCE7', color: '#166534' },
                    status === 'cancelled' && { backgroundColor: '#FEE2E2', color: '#991B1B' },
                  ]}>
                    {status.toUpperCase()}
                  </Text>
                  <Text>Invoice #{invoiceNumber}</Text>
                  <Text>Date: {invoiceDate}</Text>
                  <Text>Due Date: {dueDate}</Text>
                </View>
              </View>

              {contactDetails && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Billed To</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{contactDetails.name}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{contactDetails.email}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{contactDetails.phone}</Text>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Booking Details</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Destination:</Text>
                  <Text style={styles.value}>{destination.name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Location:</Text>
                  <Text style={styles.value}>{destination.location}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Travel Date:</Text>
                  <Text style={styles.value}>{bookingDate}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Duration:</Text>
                  <Text style={styles.value}>{destination.duration_recommended || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Price Breakdown</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Price per Person:</Text>
                  <Text style={styles.value}>${destination.price.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Number of People:</Text>
                  <Text style={styles.value}>{numberOfPeople}</Text>
                </View>
                {destination.additional_costs && Object.entries(destination.additional_costs).map(([key, value]) => (
                  <View key={key} style={styles.row}>
                    <Text style={styles.label}>{key}:</Text>
                    <Text style={styles.value}>${Number(value).toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.total}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount Due</Text>
                  <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.note}>
                <Text style={styles.noteText}>
                  Payment Instructions:{'\n'}
                  1. Please include the invoice number ({invoiceNumber}) in your payment reference.{'\n'}
                  2. Payment is due by {dueDate}.{'\n'}
                  3. Accepted payment methods: Credit Card, Bank Transfer, Mobile Money{'\n'}
                  4. For bank transfers, please contact us for bank details.
                </Text>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Thank you for choosing TravelApp. For any queries regarding your booking,
                  please contact our customer support team at support@travelapp.com or +1 234 567 890.
                </Text>
              </View>
            </Page>
          </Document>
        </PDFViewer>
      </div>
    </div>
  );
};
