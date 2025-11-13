// components/booking/BookingChat.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface BookingChatProps {
  bookingId: string;
}

export default function BookingChat({ bookingId }: BookingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${bookingId}`);

      if (!res.ok) {
        console.error(`Failed to fetch messages: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.ok) {
        setMessages(data.data.messages);
        setCurrentUserId(data.data.currentUserId);
      } else {
        console.error("Failed to fetch messages:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const res = await fetch(`/api/messages/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessages((prev) => [...prev, data.data.message]);
        setNewMessage("");
      } else {
        // Show error message to user
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900/50 rounded-lg border border-white/10">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-white/60 text-sm">
              Start a conversation with your mentor/student!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.sender.image ? (
                    <Image
                      src={message.sender.image}
                      alt={message.sender.name || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-semibold text-sm">
                      {(message.sender.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[70%]`}>
                  <div
                    className={`px-4 py-3 rounded-2xl border ${
                      isCurrentUser
                        ? "bg-black border-primary-500/50 text-primary-500"
                        : "bg-black border-white/20 text-primary-500"
                    }`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs font-bold mb-1 text-primary-400">
                        {message.sender.name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words font-medium">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 mt-1 px-1">
                    {new Date(message.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-[#F4D03F] hover:bg-[#F7DC6F] disabled:bg-white/10 disabled:text-white/40 text-[#1a1a1a] font-black rounded-lg transition-all duration-200 hover:scale-105 shadow-xl shadow-yellow-500/50 hover:shadow-yellow-400/60 flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
