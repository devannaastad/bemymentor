"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (data.ok) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      if (res.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

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
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
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
    </div>
  );
}
