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

export default function BookingList({ bookings }: BookingListProps) {
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
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

  async function handleUpdateStatus(newStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED") {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/mentor/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update booking");

      setCurrentStatus(newStatus);
      setShowCancelModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update booking:", err);
      alert("Failed to update booking. Please try again.");
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
            <div className="mt-2">
              <p className="text-white/60">Meeting Link</p>
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-400 hover:underline"
              >
                {booking.meetingLink}
              </a>
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

        {currentStatus === "CONFIRMED" && (
          <>
            <Button onClick={() => handleUpdateStatus("COMPLETED")} disabled={isUpdating} variant="primary" size="sm">
              ✅ Mark as Completed
            </Button>
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
