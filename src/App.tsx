
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Index } from "@/pages/Index";
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { Documentation } from "@/pages/Documentation";
import { DestinationDetails } from "@/pages/DestinationDetails";
import { EventDetails } from "@/pages/EventDetails";
import { PaymentPage } from "@/pages/PaymentPage";
import { DestinationsPage } from "@/pages/DestinationsPage";
import { Toaster } from "sonner";
import "@/App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="destination/:id" element={<DestinationDetails />} />
          <Route path="event/:id" element={<EventDetails />} />
          <Route path="payment" element={<PaymentPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
