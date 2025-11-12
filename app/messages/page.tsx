// app/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/common/Card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface Conversation {
  bookingId: string;
  bookingType: string;
  scheduledAt: string | null;
  otherPerson: {
    name: string | null;
    image: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();

      if (data.ok) {
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (bookingId: string) => {
    router.push(`/bookings/${bookingId}/confirm?tab=messages`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="h1 mb-2">Messages</h1>
          <p className="text-white/60">All your conversations in one place</p>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mb-4 text-6xl">💬</div>
              <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
              <p className="text-white/60 mb-4">
                When you book a session or get booked, you&apos;ll be able to message here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.bookingId}
                className="cursor-pointer hover:border-primary-500/50 transition-all"
                onClick={() => handleConversationClick(conversation.bookingId)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {conversation.otherPerson.image ? (
                        <Image
                          src={conversation.otherPerson.image}
                          alt={conversation.otherPerson.name || "User"}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-semibold">
                          {(conversation.otherPerson.name || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {conversation.otherPerson.name}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-white/40 ml-2 flex-shrink-0">
                            {formatTimeAgo(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white/40">
                          {conversation.bookingType === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                        </span>
                        {conversation.scheduledAt && (
                          <>
                            <span className="text-xs text-white/20">•</span>
                            <span className="text-xs text-white/40">
                              {new Date(conversation.scheduledAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${
                            conversation.unreadCount > 0 && !conversation.lastMessage.isFromMe
                              ? "text-white font-medium"
                              : "text-white/60"
                          }`}>
                            {conversation.lastMessage.isFromMe && (
                              <span className="text-white/40 mr-1">You:</span>
                            )}
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && !conversation.lastMessage.isFromMe && (
                            <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
