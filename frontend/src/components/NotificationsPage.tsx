"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Trash2, Check, CheckCheck, RefreshCw, Filter, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useCommonTranslations } from '@/hooks/useTranslations';
import { useRouter } from 'next/navigation';

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    deleteNotification,
    markAsViewed,
    markAllAsViewed,
    fetchNotifications,
    clearError
  } = useNotifications();

  const t = useCommonTranslations();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Load more notifications on mount
  useEffect(() => {
    fetchNotifications(50, 0); // Load more notifications for the full page
  }, [fetchNotifications]);

  // Filter notifications based on selected status
  const filteredNotifications = notifications.filter(notification => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'unread') return notification.status !== 'viewed';
    return notification.status === selectedStatus;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
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
  }, {} as Record<string, typeof filteredNotifications>);

  // Get notification color based on status
  const getNotificationColor = (status: string) => {
    switch (status) {
      case 'error':
        return 'bg-strokeError/10 border-strokeError text-red-800';
      case 'warning':
        return 'bg-reschedule/20 border-reschedule text-textBlack';
      case 'success':
        return 'bg-strokeSuccess/20 border-strokeSuccess text-green-800';
      case 'viewed':
        return 'bg-bgDisabled border-strokeGrey text-textGrey';
      default:
        return 'bg-strokeValidation/10 border-strokeValidation text-textBlack';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!isSelectMode) {
      if (notification.status !== 'viewed') {
        await markAsViewed(notification.notification_id);
      }
    } else {
      toggleNotificationSelection(notification.notification_id);
    }
  };

  const handleDelete = async (notificationId: number, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.size} notification(s)?`)) {
      const deletePromises = Array.from(selectedNotifications).map(id => deleteNotification(id));
      await Promise.all(deletePromises);
      setSelectedNotifications(new Set());
      setIsSelectMode(false);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.size === 0) return;
    
    const markPromises = Array.from(selectedNotifications).map(id => markAsViewed(id));
    await Promise.all(markPromises);
    setSelectedNotifications(new Set());
    setIsSelectMode(false);
  };

  const toggleNotificationSelection = (notificationId: number) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.notification_id)));
    }
  };

  const statusFilters = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'info', label: 'Info', count: notifications.filter(n => n.status === 'info').length },
    { value: 'success', label: 'Success', count: notifications.filter(n => n.status === 'success').length },
    { value: 'warning', label: 'Warning', count: notifications.filter(n => n.status === 'warning').length },
    { value: 'error', label: 'Error', count: notifications.filter(n => n.status === 'error').length },
  ];

  return (
    <div className="min-h-screen bg-bgWhite">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg border border-strokeGrey text-textGrey hover:text-textBlack hover:border-strokeValidation transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-textBlack flex items-center space-x-2">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span>Notifications</span>
                </h1>
                {unreadCount > 0 && (
                  <p className="text-textGrey text-sm mt-1">
                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {!isSelectMode ? (
                <>
                  <button
                    onClick={() => fetchNotifications(50, 0)}
                    className="p-2 rounded-lg border border-strokeGrey text-textGrey hover:text-textBlack hover:border-strokeValidation transition-colors"
                    disabled={isLoading}
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {notifications.length > 0 && (
                    <>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsViewed}
                          className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-strokeValidation/10 border border-strokeValidation text-strokeValidation rounded-lg hover:bg-strokeValidation/20 transition-colors"
                          disabled={isLoading}
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span className="text-sm">Mark All Read</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setIsSelectMode(true)}
                        className="px-3 py-2 border border-strokeGrey text-textGrey rounded-lg hover:text-textBlack hover:border-strokeValidation transition-colors"
                      >
                        Select
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm text-textGrey">
                    {selectedNotifications.size} selected
                  </span>
                  
                  {selectedNotifications.size > 0 && (
                    <>
                      <button
                        onClick={handleBulkMarkAsRead}
                        className="px-3 py-2 bg-strokeValidation/10 border border-strokeValidation text-strokeValidation rounded-lg hover:bg-strokeValidation/20 transition-colors text-sm"
                      >
                        Mark Read
                      </button>
                      
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-2 bg-strokeError/10 border border-strokeError text-strokeError rounded-lg hover:bg-strokeError/20 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedNotifications(new Set());
                    }}
                    className="px-3 py-2 border border-strokeGrey text-textGrey rounded-lg hover:text-textBlack hover:border-strokeValidation transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-textGrey flex-shrink-0" />
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-mainYellow text-textBlack'
                    : 'bg-bgDisabled text-textGrey hover:bg-strokeGrey/20'
                }`}
              >
                <span>{filter.label}</span>
                {filter.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    selectedStatus === filter.value
                      ? 'bg-textBlack/20'
                      : 'bg-strokeGrey/30'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Select All Option (in select mode) */}
          {isSelectMode && filteredNotifications.length > 0 && (
            <div className="mt-4 p-3 bg-bgDisabled rounded-lg">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === filteredNotifications.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-strokeValidation border-strokeGrey rounded focus:ring-strokeFocused"
                />
                <span className="text-sm text-textBlack">
                  Select all notifications ({filteredNotifications.length})
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-strokeError/10 border border-strokeError text-strokeError rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="text-strokeError hover:text-strokeError/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && notifications.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainYellow"></div>
            </div>
          )}

          {/* Notifications List */}
          {Object.keys(groupedNotifications).length > 0 ? (
            Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-strokeGrey"></div>
                  <h2 className="text-lg font-semibold text-textBlack bg-bgWhite px-4">
                    {date}
                  </h2>
                  <div className="flex-1 h-px bg-strokeGrey"></div>
                </div>
                
                {/* Notifications for this date */}
                <div className="space-y-3">
                  {dateNotifications.map((notification) => (
                    <div
                      key={notification.notification_id}
                      className={`group relative p-4 sm:p-6 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.status)} ${
                        isSelectMode && selectedNotifications.has(notification.notification_id)
                          ? 'ring-2 ring-strokeValidation'
                          : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Select Mode Checkbox */}
                      {isSelectMode && (
                        <div className="absolute top-4 left-4">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.has(notification.notification_id)}
                            onChange={() => toggleNotificationSelection(notification.notification_id)}
                            className="w-4 h-4 text-strokeValidation border-strokeGrey rounded focus:ring-strokeFocused"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      <div className={`flex justify-between items-start ${isSelectMode ? 'ml-6' : ''}`}>
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-start space-x-3">
                            {/* Status Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {notification.status === 'error' && (
                                <div className="w-2 h-2 bg-strokeError rounded-full"></div>
                              )}
                              {notification.status === 'warning' && (
                                <div className="w-2 h-2 bg-reschedule rounded-full"></div>
                              )}
                              {notification.status === 'success' && (
                                <div className="w-2 h-2 bg-strokeSuccess rounded-full"></div>
                              )}
                              {notification.status === 'info' && (
                                <div className="w-2 h-2 bg-strokeValidation rounded-full"></div>
                              )}
                              {notification.status === 'viewed' && (
                                <div className="w-2 h-2 bg-strokeGrey rounded-full"></div>
                              )}
                            </div>

                            <div className="flex-1">
                              <p className="text-base font-medium mb-2 break-words leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 text-xs opacity-75">
                                <span>
                                  {new Date(notification.created_at).toLocaleString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                                <span className="capitalize">
                                  {notification.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Unread indicator */}
                          {notification.status !== 'viewed' && !isSelectMode && (
                            <div className="w-3 h-3 bg-strokeValidation rounded-full flex-shrink-0"></div>
                          )}
                          
                          {/* Delete button */}
                          {!isSelectMode && (
                            <button
                              onClick={(e) => handleDelete(notification.notification_id, e)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-textGrey hover:text-strokeError transition-all rounded-lg hover:bg-strokeError/10"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            !isLoading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 bg-bgDisabled rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-textGrey" />
                </div>
                <h3 className="text-xl font-semibold text-textBlack mb-2">
                  {selectedStatus === 'all' ? 'No notifications' : `No ${selectedStatus} notifications`}
                </h3>
                <p className="text-textGrey max-w-md mx-auto">
                  {selectedStatus === 'all' 
                    ? "You're all caught up! We'll notify you when there's something new."
                    : `No notifications with ${selectedStatus} status found. Try changing the filter.`
                  }
                </p>
                {selectedStatus !== 'all' && (
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="mt-4 px-4 py-2 bg-mainYellow text-textBlack rounded-lg hover:bg-buttonPrimaryHover transition-colors"
                  >
                    View All Notifications
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
