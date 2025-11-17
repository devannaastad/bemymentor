"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, MessageSquare } from "lucide-react";
import MessageChat from "@/components/messages/MessageChat";

interface SubscriptionTabsProps {
  subscriptionId: string;
  contentSlot: React.ReactNode;
}

export default function SubscriptionTabs({ subscriptionId, contentSlot }: SubscriptionTabsProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") === "messages" ? "messages" : "content";
  const [activeTab, setActiveTab] = useState<"content" | "messages">(initialTab);

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "content"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          Content & Resources
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "messages"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Messages
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "content" ? (
        contentSlot
      ) : (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Message Your Mentor</h2>
          <p className="mb-4 text-white/60">
            Have questions about your subscription? Send a message to your mentor.
          </p>
          <MessageChat type="subscription" id={subscriptionId} />
        </div>
      )}
    </div>
  );
}
