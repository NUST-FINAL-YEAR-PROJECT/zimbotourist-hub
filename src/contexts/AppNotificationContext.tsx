
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

type NotificationType = 'info' | 'success' | 'error' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface AppNotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
}

const AppNotificationContext = createContext<AppNotificationContextType | undefined>(undefined);

export function AppNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, type, message };
    setNotifications((prev) => [...prev, notification]);
    toast[type](message);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AppNotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </AppNotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(AppNotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within an AppNotificationProvider');
  }
  return context;
}
