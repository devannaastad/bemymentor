"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutDashboard, MessageSquare, Calendar, DollarSign, BarChart3 } from "lucide-react";

interface MentorDashboardTabsProps {
  overviewSlot: React.ReactNode;
  messagesSlot: React.ReactNode;
  calendarSlot: React.ReactNode;
  analyticsSlot: React.ReactNode;
  earningsSlot: React.ReactNode;
}

export default function MentorDashboardTabs({
  overviewSlot,
  messagesSlot,
  calendarSlot,
  analyticsSlot,
  earningsSlot,
}: MentorDashboardTabsProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "overview";

  // Validate tab parameter
  const validTabs = ["overview", "messages", "calendar", "analytics", "earnings"] as const;
  type ValidTab = typeof validTabs[number];
  const isValidTab = (tab: string): tab is ValidTab => validTabs.includes(tab as ValidTab);

  const [activeTab, setActiveTab] = useState<ValidTab>(
    isValidTab(initialTab) ? initialTab : "overview"
  );

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto border-b border-white/10">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "messages"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Messages
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "calendar"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Calendar
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "analytics"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("earnings")}
          className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "earnings"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Earnings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && overviewSlot}
      {activeTab === "messages" && messagesSlot}
      {activeTab === "calendar" && calendarSlot}
      {activeTab === "analytics" && analyticsSlot}
      {activeTab === "earnings" && earningsSlot}
    </div>
  );
}
