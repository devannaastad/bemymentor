"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import { MessageSquare, Calendar, CreditCard, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";

interface Conversation {
  type: "booking" | "subscription";
  id: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
  metadata?: {
    bookingDate?: string;
    bookingStatus?: string;
    planName?: string;
    subscriptionStatus?: string;
  };
}

export default function MentorMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "booking" | "subscription">("all");

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/mentor/conversations");
      const data = await response.json();

      if (data.ok) {
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) => filter === "all" || c.type === filter
  );

  const getConversationLink = (conversation: Conversation) => {
    if (conversation.type === "booking") {
      return `/bookings/${conversation.id}/confirm?tab=messages`;
    } else {
      return `/subscription/${conversation.id}?tab=messages`;
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === "booking") {
      return `Booking Session`;
    } else {
      return conversation.metadata?.planName || "Subscription";
    }
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.type === "booking" && conversation.metadata?.bookingDate) {
      return formatDistanceToNow(new Date(conversation.metadata.bookingDate), {
        addSuffix: true,
      });
    } else if (conversation.type === "subscription") {
      return conversation.metadata?.subscriptionStatus || "";
    }
    return "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            filter === "all"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          All Messages
        </button>
        <button
          onClick={() => setFilter("booking")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            filter === "booking"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Bookings
        </button>
        <button
          onClick={() => setFilter("subscription")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            filter === "subscription"
              ? "border-b-2 border-purple-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Subscriptions
        </button>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <h3 className="mb-2 text-lg font-semibold text-white/70">No messages yet</h3>
            <p className="text-sm text-white/50">
              {filter === "all"
                ? "Your conversations will appear here"
                : `No ${filter} messages yet`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <Link
              key={`${conversation.type}-${conversation.id}`}
              href={getConversationLink(conversation)}
            >
              <Card className="transition-all hover:border-purple-500/50 hover:bg-white/5">
                <CardContent>
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      {conversation.user.image ? (
                        <Image
                          src={conversation.user.image}
                          alt={conversation.user.name || "User"}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
                          {(conversation.user.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -right-1 -top-1">
                          <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 overflow-hidden">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-white">
                          {conversation.user.name || "Unknown User"}
                        </h3>
                        <span className="shrink-0 text-xs text-white/40">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        {conversation.type === "booking" ? (
                          <Calendar className="h-3 w-3 text-white/40" />
                        ) : (
                          <CreditCard className="h-3 w-3 text-white/40" />
                        )}
                        <span className="text-xs text-white/60">
                          {getConversationTitle(conversation)}
                          {getConversationSubtitle(conversation) && (
                            <span className="ml-1 text-white/40">
                              • {getConversationSubtitle(conversation)}
                            </span>
                          )}
                        </span>
                      </div>
                      <p
                        className={`truncate text-sm ${
                          conversation.unreadCount > 0
                            ? "font-medium text-white"
                            : "text-white/60"
                        }`}
                      >
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
