// components/common/Toast.tsx
"use client";

import { useEffect, useState } from "react";

let toastIdCounter = 0;

type ToastType = "success" | "error" | "info";

type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

const toastSubscribers = new Set<(toasts: ToastMessage[]) => void>();
let toasts: ToastMessage[] = [];

function notifySubscribers() {
  toastSubscribers.forEach((fn) => fn([...toasts]));
}

export function toast(message: string, type: ToastType = "info") {
  const id = ++toastIdCounter;
  toasts.push({ id, message, type });
  notifySubscribers();

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notifySubscribers();
  }, 3000);
}

export default function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastSubscribers.add(setMessages);
    return () => {
      toastSubscribers.delete(setMessages);
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-slide-up rounded-lg px-4 py-3 shadow-lg ${
            t.type === "success"
              ? "bg-emerald-600 text-white"
              : t.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-white/10 text-white backdrop-blur"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}