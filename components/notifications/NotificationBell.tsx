"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Notification } from "@prisma/client";

interface NotificationBellProps {
  initialCount?: number;
}

export default function NotificationBell({
  initialCount = 0,
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (data.ok) {
        const newNotifications = data.data.notifications;
        const newUnreadCount = data.data.unreadCount;

        // Check if there's a new notification
        if (newUnreadCount > unreadCount && newNotifications.length > 0) {
          const newest = newNotifications.find((n: Notification) => !n.isRead);
          if (newest && (!latestNotification || newest.id !== latestNotification.id)) {
            setLatestNotification(newest);
            setShowPopup(true);
          }
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(true); // Silent fetch
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount, latestNotification]);

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/delete`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove notification from local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Update unread count if notification was unread
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Delete the notification when clicked
    deleteNotification(notification.id);

    if (notification.link) {
      window.location.href = notification.link;
    }

    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1">
            <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse border-2 border-gray-900" />
          </div>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-gray-900 border border-white/20 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">Notifications</h3>
            </div>

            {loading && (
              <div className="p-8 text-center text-white/60">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-8 text-center text-white/60">
                No notifications yet
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                      !notification.isRead ? "bg-primary-500/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm mb-1">
                          {notification.title}
                        </p>
                        <p className="text-white/60 text-xs line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Popup Notification Toast */}
      {showPopup && latestNotification && (
        <div className="fixed top-20 right-4 z-[100] w-96 animate-slide-up">
          <div className="bg-gray-800 border-2 border-primary-500/70 rounded-lg shadow-2xl shadow-primary-500/30 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary-500" />
                  <h4 className="font-semibold text-white text-sm">New Notification</h4>
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="font-medium text-white text-sm mb-1">
                {latestNotification.title}
              </p>
              <p className="text-white/70 text-sm mb-4">
                {latestNotification.message}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {latestNotification.link && (
                  <button
                    onClick={() => {
                      deleteNotification(latestNotification.id);
                      window.location.href = latestNotification.link!;
                      setShowPopup(false);
                    }}
                    className="px-6 py-3 bg-[#F4D03F] hover:bg-[#F7DC6F] text-[#1a1a1a] text-base font-black rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-2xl shadow-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-400/80 uppercase tracking-wider"
                  >
                    VIEW NOW
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteNotification(latestNotification.id);
                    setShowPopup(false);
                  }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-base font-medium rounded-lg transition-all duration-200 border border-white/10"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
