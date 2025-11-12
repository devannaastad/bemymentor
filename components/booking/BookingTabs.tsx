// components/booking/BookingTabs.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BookingChat from "./BookingChat";

interface BookingTabsProps {
  bookingId: string;
  detailsContent: React.ReactNode;
  showChat?: boolean;
}

export default function BookingTabs({
  bookingId,
  detailsContent,
  showChat = true,
}: BookingTabsProps) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl === "messages" ? "messages" : "details");

  useEffect(() => {
    if (tabFromUrl === "messages") {
      setActiveTab("messages");
    }
  }, [tabFromUrl]);

  if (!showChat) {
    return <>{detailsContent}</>;
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === "details"
              ? "text-primary-500"
              : "text-white/60 hover:text-white"
          }`}
        >
          Booking Details
          {activeTab === "details" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === "messages"
              ? "text-primary-500"
              : "text-white/60 hover:text-white"
          }`}
        >
          Messages
          {activeTab === "messages" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "details" ? (
        detailsContent
      ) : (
        <BookingChat bookingId={bookingId} />
      )}
    </div>
  );
}
