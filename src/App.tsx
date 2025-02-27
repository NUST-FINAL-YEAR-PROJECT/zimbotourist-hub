
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { HomePage } from "@/pages/HomePage";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import { DestinationsPage } from "@/pages/DestinationsPage";
import { DestinationDetails } from "@/pages/DestinationDetails";
import { EventsPage } from "@/pages/EventsPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AppNotificationProvider } from "@/contexts/AppNotificationContext";
import { AccommodationsPage } from "@/pages/AccommodationsPage";

function App() {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-react-theme"
    >
      <AuthProvider>
        <AppNotificationProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="destinations" />} />
              <Route path="destinations" element={<DestinationsPage />} />
              <Route path="destinations/:id" element={<DestinationDetails />} />
              <Route path="accommodations" element={<AccommodationsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppNotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/sign-in" replace />
  );
}

export default App;
