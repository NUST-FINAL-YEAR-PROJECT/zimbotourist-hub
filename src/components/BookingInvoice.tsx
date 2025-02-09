
import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Destination } from "@/types/models";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    marginBottom: 4,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    marginBottom: 4,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
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
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    color: '#111827',
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
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 10,
    borderTop: 1,
    borderColor: '#E5E7EB',
    paddingTop: 20,
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
}

export const BookingInvoice = ({ destination, numberOfPeople, date, contactDetails }: BookingInvoiceProps) => {
  const invoiceDate = format(new Date(), "MMMM d, yyyy");
  const bookingDate = format(date, "MMMM d, yyyy");
  
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>TravelApp</Text>
            <Text style={styles.title}>Booking Invoice</Text>
            <Text style={styles.subtitle}>Invoice Date: {invoiceDate}</Text>
          </View>

          {contactDetails && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
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
            <Text style={styles.sectionTitle}>Destination Details</Text>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Number of People:</Text>
              <Text style={styles.value}>{numberOfPeople}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Price per Person:</Text>
              <Text style={styles.value}>${destination.price}</Text>
            </View>
          </View>

          <View style={styles.total}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${destination.price * numberOfPeople}</Text>
            </View>
          </View>

          <Text style={styles.footer}>
            Thank you for choosing TravelApp. For any queries regarding your booking, 
            please contact our customer support team.
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
};
