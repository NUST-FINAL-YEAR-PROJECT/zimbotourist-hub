import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import type { Destination } from "@/types/models";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: 1,
  },
  contactInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
});

interface BookingInvoiceProps {
  destination: Destination;
  numberOfPeople: number;
  date: Date;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export const BookingInvoice = ({ 
  destination, 
  numberOfPeople, 
  date,
  contactName,
  contactEmail,
  contactPhone,
}: BookingInvoiceProps) => {
  return (
    <PDFViewer className="w-full h-[600px]">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Travel Booking Invoice</Text>
            <Text>Date: {date.toLocaleDateString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Destination Details</Text>
            <View style={styles.row}>
              <Text>Destination:</Text>
              <Text>{destination.name}</Text>
            </View>
            <View style={styles.row}>
              <Text>Location:</Text>
              <Text>{destination.location}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Contact Information</Text>
            <View style={styles.row}>
              <Text>Name:</Text>
              <Text>{contactName}</Text>
            </View>
            <View style={styles.row}>
              <Text>Email:</Text>
              <Text>{contactEmail}</Text>
            </View>
            <View style={styles.row}>
              <Text>Phone:</Text>
              <Text>{contactPhone}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Booking Details</Text>
            <View style={styles.row}>
              <Text>Number of People:</Text>
              <Text>{numberOfPeople}</Text>
            </View>
            <View style={styles.row}>
              <Text>Price per Person:</Text>
              <Text>${destination.price}</Text>
            </View>
          </View>

          <View style={[styles.section, styles.total]}>
            <View style={styles.row}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Total Amount:</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>${destination.price * numberOfPeople}</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};