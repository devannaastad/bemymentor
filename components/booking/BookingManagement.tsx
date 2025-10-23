"use client";

import { useState } from "react";
import { Booking, Mentor, BookingStatus } from "@prisma/client";
import Image from "next/image";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { Calendar, Clock, User, MoreVertical } from "lucide-react";
import RescheduleBookingModal from "./RescheduleBookingModal";
import CancelBookingModal from "./CancelBookingModal";

type BookingWithMentor = Booking & {
  mentor: Pick<Mentor, "id" | "name" | "profileImage">;
};

interface BookingManagementProps {
  bookings: BookingWithMentor[];
  onUpdate: () => void;
}

export default function BookingManagement({
  bookings,
  onUpdate,
}: BookingManagementProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithMentor | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleReschedule = (booking: BookingWithMentor) => {
    setSelectedBooking(booking);
    setShowReschedule(true);
    setOpenMenuId(null);
  };

  const handleCancel = (booking: BookingWithMentor) => {
    setSelectedBooking(booking);
    setShowCancel(true);
    setOpenMenuId(null);
  };

  const handleSuccess = () => {
    setShowReschedule(false);
    setShowCancel(false);
    setSelectedBooking(null);
    onUpdate();
  };

  const getStatusVariant = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "success";
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "warning";
      case "CANCELLED":
      case "REFUNDED":
        return "danger";
      default:
        return "default";
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No bookings yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-6 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Mentor Image */}
                {booking.mentor.profileImage && (
                  <Image
                    src={booking.mentor.profileImage}
                    alt={booking.mentor.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}

                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">
                      {booking.mentor.name}
                    </h3>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {booking.type === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                      </span>
                    </div>

                    {booking.scheduledAt && (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(booking.scheduledAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {booking.durationMinutes && ` (${booking.durationMinutes} min)`}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="pt-1">
                      <span className="text-primary-400 font-medium">
                        ${(booking.totalPrice / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Menu */}
              {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === booking.id ? null : booking.id)
                    }
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-white/60" />
                  </button>

                  {openMenuId === booking.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/20 rounded-lg shadow-lg z-10">
                      {booking.type === "SESSION" && booking.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleReschedule(booking)}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors rounded-t-lg"
                        >
                          Reschedule
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(booking)}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors rounded-b-lg"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Meeting Link for confirmed sessions */}
            {booking.type === "SESSION" &&
              booking.status === "CONFIRMED" &&
              booking.meetingLink && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(booking.meetingLink || "", "_blank")}
                  >
                    Join Meeting
                  </Button>
                </div>
              )}

            {/* Cancellation reason */}
            {booking.status === "CANCELLED" && booking.cancellationReason && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 mb-1">Cancellation reason:</p>
                <p className="text-sm text-white/60">{booking.cancellationReason}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {showReschedule && selectedBooking && selectedBooking.scheduledAt && (
        <RescheduleBookingModal
          bookingId={selectedBooking.id}
          currentDate={selectedBooking.scheduledAt}
          onClose={() => {
            setShowReschedule(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {showCancel && selectedBooking && (
        <CancelBookingModal
          bookingId={selectedBooking.id}
          bookingType={selectedBooking.type}
          onClose={() => {
            setShowCancel(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
