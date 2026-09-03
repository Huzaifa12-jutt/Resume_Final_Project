import { useState, useEffect, useCallback } from 'react';
import { messagingService } from '../services/messagingService';
import useAuth from './useAuth';

export default function useMessagingUnread(pollInterval = 20000) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await messagingService.getUnreadCount();
      setUnreadCount(data?.unread_count || 0);
    } catch (err) {
      // Silently ignore background polling errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnread();
    const interval = setInterval(fetchUnread, pollInterval);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnread, pollInterval]);

  return { unreadCount, refreshUnread: fetchUnread };
}
