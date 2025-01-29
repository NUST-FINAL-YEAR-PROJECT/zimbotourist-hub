import { Page, Text, View, Document, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Destination, Event } from "@/types/models";

interface BookingInvoiceProps {
  destination?: Destination;
  event?: Event;
  numberOfPeople: number;
  date: Date;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 20, color: "#666" },
  section: { marginBottom: 15 },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: 150, fontWeight: "bold" },
  value: { flex: 1 },
  total: { marginTop: 20, borderTopWidth: 1, paddingTop: 10 },
  totalText: { fontSize: 18, fontWeight: "bold" },
});

export const BookingInvoice = ({ 
  destination,
  event,
  numberOfPeople,
  date,
  contactName,
  contactEmail,
  contactPhone,
}: BookingInvoiceProps) => {
  const item = destination || event;
  if (!item) return null;

  const price = item.price * numberOfPeople;

  return (
    <PDFViewer style={{ width: "100%", height: "100%" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Booking Invoice</Text>
            <Text style={styles.subtitle}>
              {destination ? "Destination Booking" : "Event Booking"}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Booking Reference:</Text>
              <Text style={styles.value}>{Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{format(new Date(), "MMMM d, yyyy")}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>{destination ? "Destination" : "Event"}:</Text>
              <Text style={styles.value}>{destination ? destination.name : event?.title}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{item.location}</Text>
            </View>
            {event && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Start Date:</Text>
                  <Text style={styles.value}>{format(new Date(event.start_date), "MMMM d, yyyy")}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>End Date:</Text>
                  <Text style={styles.value}>{format(new Date(event.end_date), "MMMM d, yyyy")}</Text>
                </View>
              </>
            )}
            {destination && (
              <View style={styles.row}>
                <Text style={styles.label}>Preferred Date:</Text>
                <Text style={styles.value}>{format(date, "MMMM d, yyyy")}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Contact Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{contactName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{contactEmail}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{contactPhone}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Booking Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Number of People:</Text>
              <Text style={styles.value}>{numberOfPeople}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Price per Person:</Text>
              <Text style={styles.value}>${item.price}</Text>
            </View>
          </View>

          <View style={styles.total}>
            <View style={styles.row}>
              <Text style={styles.totalText}>Total Amount:</Text>
              <Text style={styles.totalText}>${price}</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};