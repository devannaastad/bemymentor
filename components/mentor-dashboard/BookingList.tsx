// components/mentor-dashboard/BookingList.tsx
"use client";

import { useState } from "react";
import type { Booking, User } from "@prisma/client";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Image from "next/image";
import Modal from "@/components/common/Modal";

type BookingWithUser = Booking & {
  user: Pick<User, "id" | "name" | "email" | "image">;
};

interface BookingListProps {
  bookings: BookingWithUser[];
}

type TabType = "all" | "pending" | "awaiting-payment" | "upcoming" | "completed" | "cancelled";

export default function BookingList({ bookings }: BookingListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;

    if (activeTab === "pending") {
      return booking.status === "PENDING" && !booking.stripePaymentIntentId;
    }

    if (activeTab === "awaiting-payment") {
      return booking.status === "PENDING" && booking.stripePaymentIntentId;
    }

    if (activeTab === "upcoming") {
      return booking.status === "CONFIRMED";
    }

    if (activeTab === "completed") {
      return booking.status === "COMPLETED";
    }

    if (activeTab === "cancelled") {
      return booking.status === "CANCELLED" || booking.status === "REFUNDED";
    }

    return true;
  });

  // Calculate counts for each tab
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING" && !b.stripePaymentIntentId).length,
    awaitingPayment: bookings.filter((b) => b.status === "PENDING" && b.stripePaymentIntentId).length,
    upcoming: bookings.filter((b) => b.status === "CONFIRMED").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED" || b.status === "REFUNDED").length,
  };

  const tabs = [
    { id: "all" as TabType, label: "All", count: counts.all, emoji: "📊" },
    { id: "pending" as TabType, label: "Pending Requests", count: counts.pending, emoji: "⏳" },
    { id: "awaiting-payment" as TabType, label: "Awaiting Payment", count: counts.awaitingPayment, emoji: "💳" },
    { id: "upcoming" as TabType, label: "Upcoming", count: counts.upcoming, emoji: "📅" },
    { id: "completed" as TabType, label: "Completed", count: counts.completed, emoji: "✅" },
    { id: "cancelled" as TabType, label: "Cancelled", count: counts.cancelled, emoji: "❌" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 border-b border-white/10 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-500/20 text-primary-300 border-b-2 border-primary-500"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <Badge variant={activeTab === tab.id ? "default" : "outline"} className="text-xs">
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">📭</div>
          <h3 className="mb-2 text-lg font-semibold">No Bookings</h3>
          <p className="text-white/60">
            {activeTab === "all" && "When learners book sessions with you, they'll appear here."}
            {activeTab === "pending" && "No pending booking requests at this time."}
            {activeTab === "awaiting-payment" && "No bookings awaiting payment."}
            {activeTab === "upcoming" && "No upcoming confirmed sessions."}
            {activeTab === "completed" && "No completed sessions yet."}
            {activeTab === "cancelled" && "No cancelled bookings."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingWithUser }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(booking.status);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const userName = booking.user.name || "Unknown User";
  const userEmail = booking.user.email || "";
  const formattedPrice = (booking.totalPrice / 100).toFixed(2);
  const scheduledDate = booking.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  // Check if the session date/time has passed
  const canMarkCompleted = () => {
    // For ACCESS bookings, can be marked completed anytime
    if (booking.type === "ACCESS") return true;

    // For SESSION bookings, check if scheduled time + duration has passed
    if (!booking.scheduledAt || !booking.durationMinutes) return false;

    const sessionEnd = new Date(booking.scheduledAt);
    sessionEnd.setMinutes(sessionEnd.getMinutes() + booking.durationMinutes);

    return new Date() >= sessionEnd;
  };

  const isSessionComplete = canMarkCompleted();

  async function handleUpdateStatus(newStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED") {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/mentor/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update booking");
      }

      setCurrentStatus(newStatus);
      setShowCancelModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update booking:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update booking. Please try again.";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }

  function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" {
    if (status === "PENDING") return "warning";
    if (status === "CONFIRMED") return "success";
    if (status === "CANCELLED" || status === "REFUNDED") return "danger";
    return "default";
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {booking.user.image && (
            <Image
              src={booking.user.image}
              alt={userName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold">{userName}</h3>
            <p className="text-sm text-white/60">{userEmail}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={getStatusVariant(currentStatus)}>{currentStatus}</Badge>
              <Badge variant="outline">
                {booking.type === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/60">Amount</p>
          <p className="text-xl font-bold">${formattedPrice}</p>
        </div>
      </div>

      {booking.type === "SESSION" && scheduledDate && (
        <div className="mb-4 rounded-lg bg-white/5 p-3">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-white/60">Scheduled</p>
              <p className="font-medium">{scheduledDate}</p>
            </div>
            <div>
              <p className="text-white/60">Duration</p>
              <p className="font-medium">{booking.durationMinutes} minutes</p>
            </div>
          </div>
          {booking.meetingLink && (
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-white/60 mb-1">Meeting Link</p>
                <a
                  href={booking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-400 hover:underline break-all"
                >
                  {booking.meetingLink}
                </a>
              </div>
              <Button
                href={booking.meetingLink}
                variant="primary"
                size="sm"
                target="_blank"
                className="whitespace-nowrap"
              >
                Join Meeting 🎥
              </Button>
            </div>
          )}
        </div>
      )}

      {booking.notes && (
        <div className="mb-4 rounded-lg bg-white/5 p-3">
          <p className="mb-1 text-sm text-white/60">Learner Notes</p>
          <p className="text-sm">{booking.notes}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentStatus === "PENDING" && (
          <>
            <Button onClick={() => handleUpdateStatus("CONFIRMED")} disabled={isUpdating} variant="primary" size="sm">
              ✅ Confirm Booking
            </Button>
            <Button onClick={() => setShowCancelModal(true)} disabled={isUpdating} variant="ghost" size="sm">
              ❌ Decline
            </Button>
          </>
        )}

        {currentStatus === "CONFIRMED" && booking.status === "CONFIRMED" && (
          <>
            {booking.meetingLink && booking.type === "SESSION" && (
              <Button
                href={booking.meetingLink}
                variant="primary"
                size="sm"
                target="_blank"
              >
                Join Meeting 🎥
              </Button>
            )}
            <div className="flex flex-col gap-1">
              <Button
                onClick={() => handleUpdateStatus("COMPLETED")}
                disabled={isUpdating || !isSessionComplete}
                variant={booking.meetingLink ? "ghost" : "primary"}
                size="sm"
                title={!isSessionComplete ? "Session must be completed before marking as done" : ""}
              >
                ✅ Mark as Completed
              </Button>
              {!isSessionComplete && booking.type === "SESSION" && (
                <p className="text-xs text-amber-400">
                  Available after session ends
                </p>
              )}
            </div>
            <Button onClick={() => setShowCancelModal(true)} disabled={isUpdating} variant="ghost" size="sm">
              ❌ Cancel
            </Button>
          </>
        )}

        {currentStatus === "COMPLETED" && <Badge variant="success">Session Completed</Badge>}
        {currentStatus === "CANCELLED" && <Badge variant="danger">Booking Cancelled</Badge>}
      </div>

      <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
        <p>
          Booking ID: {booking.id} • Created{" "}
          {new Date(booking.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
        </p>
      </div>

      <Modal open={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <h3 className="text-base font-semibold text-white">Cancel Booking?</h3>
        <p className="mt-1 text-sm text-neutral-300">
          Are you sure you want to cancel this booking with {userName}? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setShowCancelModal(false)} disabled={isUpdating} variant="secondary">
            Nevermind
          </Button>
          <Button onClick={() => handleUpdateStatus("CANCELLED")} disabled={isUpdating} variant="danger">
            {isUpdating ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
