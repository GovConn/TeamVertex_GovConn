"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Types (same as before)
interface Notification {
  notification_id: number;
  nic: string;
  message: string;
  status: 'info' | 'warning' | 'error' | 'success' | 'viewed';
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isPopupOpen: boolean;
  setIsPopupOpen: (open: boolean) => void;
  fetchNotifications: (limit?: number, startCount?: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<boolean>;
  markAsViewed: (notificationId: number) => Promise<boolean>;
  markAllAsViewed: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Get base URL from environment
const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
  }
  return baseUrl;
};

// Enhanced API request with authentication
const authenticatedRequest = async (
  url: string, 
  options: RequestInit = {},
  authToken?: string
): Promise<Response> => {
  const token = authToken || localStorage.getItem('govconn_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  // Calculate unread count
  const unreadCount = notifications.filter(notification => notification.status !== 'viewed').length;

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (limit: number = 10, startCount: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const storedUser = localStorage.getItem('govconn_user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const userData = JSON.parse(storedUser);
      const nic = userData.nic;

      if (!nic) {
        throw new Error('User NIC not found');
      }

      const baseUrl = getBaseUrl();
      const response = await authenticatedRequest(
        `${baseUrl}/api/v1/notifications/get`,
        {
          method: 'POST',
          body: JSON.stringify({
            limit,
            nic,
            start_count: startCount
          })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please log in again');
        }
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }

      const notificationData: Notification[] = await response.json();
      
      if (startCount === 0) {
        setNotifications(notificationData);
      } else {
        setNotifications(prev => [...prev, ...notificationData]);
      }

    } catch (error) {
      console.error('Fetch notifications error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number): Promise<boolean> => {
    try {
      setError(null);
      const baseUrl = getBaseUrl();
      
      const response = await authenticatedRequest(
        `${baseUrl}/api/v1/notifications/delete/${notificationId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status} ${response.statusText}`);
      }

      setNotifications(prev => prev.filter(notification => notification.notification_id !== notificationId));
      return true;

    } catch (error) {
      console.error('Delete notification error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete notification');
      return false;
    }
  }, []);

  // Mark notification as viewed
  const markAsViewed = useCallback(async (notificationId: number): Promise<boolean> => {
    try {
      setError(null);
      
      const notification = notifications.find(n => n.notification_id === notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      const baseUrl = getBaseUrl();
      const response = await authenticatedRequest(
        `${baseUrl}/api/v1/notifications/update/`,
        {
          method: 'PUT',
          body: JSON.stringify({
            notification_id: notificationId,
            message: notification.message,
            status: 'viewed'
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update notification: ${response.status} ${response.statusText}`);
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === notificationId 
            ? { ...notification, status: 'viewed' as const }
            : notification
        )
      );
      return true;

    } catch (error) {
      console.error('Mark as viewed error:', error);
      setError(error instanceof Error ? error.message : 'Failed to mark notification as viewed');
      return false;
    }
  }, [notifications]);

  // Mark all notifications as viewed
  const markAllAsViewed = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const unviewedNotifications = notifications.filter(n => n.status !== 'viewed');
      
      const updatePromises = unviewedNotifications.map(notification =>
        markAsViewed(notification.notification_id)
      );

      const results = await Promise.all(updatePromises);
      return results.every(result => result === true);

    } catch (error) {
      console.error('Mark all as viewed error:', error);
      setError(error instanceof Error ? error.message : 'Failed to mark all notifications as viewed');
      return false;
    }
  }, [notifications, markAsViewed]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(10, 0);
  }, [fetchNotifications]);

  // Auto-refresh notifications periodically
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      error,
      isPopupOpen,
      setIsPopupOpen,
      fetchNotifications,
      deleteNotification,
      markAsViewed,
      markAllAsViewed,
      refreshNotifications,
      clearError
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
