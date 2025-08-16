"use client";
import React, { useEffect, useRef } from 'react';
import { X, Trash2, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useCommonTranslations } from '@/hooks/useTranslations';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    deleteNotification,
    markAsViewed,
    markAllAsViewed,
    refreshNotifications,
    clearError
  } = useNotifications();

  const t = useCommonTranslations();
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  // Get notification color based on status using your color system
  const getNotificationColor = (status: string) => {
    switch (status) {
      case 'error':
        return 'bg-red-50 border-strokeError text-red-800';
      case 'warning':
        return 'bg-reschedule/20 border-reschedule text-textBlack';
      case 'success':
        return 'bg-success/20 border-strokeSuccess text-green-800';
      case 'viewed':
        return 'bg-bgDisabled border-strokeGrey text-textGrey';
      default:
        return 'bg-validation/10 border-strokeValidation text-textBlack';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (notification.status !== 'viewed') {
      await markAsViewed(notification.notification_id);
    }
  };

  const handleDelete = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsViewed();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-textBlack/50 opacity-40 z-40" />
      
      {/* Popup */}
      <div 
        ref={popupRef}
        className="fixed top-16 right-4 sm:right-6 lg:right-8 w-80 sm:w-96 max-h-[80vh] bg-bgWhite rounded-lg shadow-xl border border-strokeGrey z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-strokeGrey">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-textBlack">
              {t('notifications')}
            </h2>
            {unreadCount > 0 && (
              <span className="bg-strokeError text-textWhite text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-strokeValidation hover:text-strokeValidation/80 flex items-center space-x-1 transition-colors"
                disabled={isLoading}
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            
            <button
              onClick={refreshNotifications}
              className="p-1 text-textGrey hover:text-textBlack transition-colors"
              disabled={isLoading}
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button
              onClick={onClose}
              className="p-1 text-textGrey hover:text-textBlack transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-strokeError/10 border border-strokeError text-strokeError rounded-md text-sm">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="text-strokeError hover:text-strokeError/80 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {isLoading && notifications.length === 0 && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mainYellow"></div>
            </div>
          )}

          {/* Notifications List */}
          {Object.keys(groupedNotifications).length > 0 ? (
            <div className="space-y-4 p-4">
              {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="text-center text-textGrey text-xs mb-3 border-b border-strokeGrey pb-2">
                    {date}
                  </div>
                  
                  {/* Notifications for this date */}
                  <div className="space-y-2">
                    {dateNotifications.map((notification) => (
                      <div
                        key={notification.notification_id}
                        className={`group p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${getNotificationColor(notification.status)}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1 break-words">
                              {notification.message}
                            </p>
                            <p className="text-xs opacity-75">
                              {new Date(notification.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            {/* Unread indicator */}
                            {notification.status !== 'viewed' && (
                              <div className="w-2 h-2 bg-strokeValidation rounded-full"></div>
                            )}
                            
                            {/* Delete button */}
                            <button
                              onClick={(e) => handleDelete(notification.notification_id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-textGrey hover:text-strokeError transition-all"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            !isLoading && (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-bgDisabled rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-textGrey" />
                </div>
                <h3 className="text-sm font-medium text-textBlack mb-1">No notifications</h3>
                <p className="text-xs text-textGrey">You're all caught up!</p>
              </div>
            )
          )}
        </div>

        {/* Footer - View All Link */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-strokeGrey">
            <button
              onClick={() => {
                onClose();
                // Navigate to full notifications page
                window.location.href = '/notifications';
              }}
              className="w-full text-sm text-center text-strokeValidation hover:text-strokeValidation/80 font-medium transition-colors"
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPopup;
