import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

// Notification type icon map — used by the drawer
export const NOTIF_ICONS = {
  upload: '📄',
  ranking: '🏆',
  application: '📬',
  interview: '📅',
  system: '🔔',
  default: '🔔',
};

export const NotificationProvider = ({ children }) => {
  // Start with ZERO dummy data — all notifications come from real actions
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: 'n_' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'default',
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    toast(newNotif.title, { icon: NOTIF_ICONS[newNotif.type] || '🔔' });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
