// components/common/Toast.tsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

let toastIdCounter = 0;

type ToastType = "success" | "error" | "info" | "warning";

type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
};

const toastSubscribers = new Set<(toasts: ToastMessage[]) => void>();
let toasts: ToastMessage[] = [];

function notifySubscribers() {
  toastSubscribers.forEach((fn) => fn([...toasts]));
}

export function toast(message: string, type: ToastType = "info", duration: number = 5000) {
  const id = ++toastIdCounter;
  toasts.push({ id, message, type, duration });
  notifySubscribers();

  // Auto-remove after specified duration
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notifySubscribers();
  }, duration);
}

// Convenience methods
toast.success = (message: string, duration?: number) => toast(message, "success", duration);
toast.error = (message: string, duration?: number) => toast(message, "error", duration);
toast.info = (message: string, duration?: number) => toast(message, "info", duration);
toast.warning = (message: string, duration?: number) => toast(message, "warning", duration);

function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notifySubscribers();
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
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {messages.map((t) => {
        const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? XCircle : Info;

        return (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 shadow-xl
              backdrop-blur-sm border animate-in slide-in-from-right duration-300
              ${
                t.type === "success"
                  ? "bg-emerald-500/90 border-emerald-400/50 text-white"
                  : t.type === "error"
                  ? "bg-rose-500/90 border-rose-400/50 text-white"
                  : t.type === "warning"
                  ? "bg-amber-500/90 border-amber-400/50 text-white"
                  : "bg-purple-500/90 border-purple-400/50 text-white"
              }
            `}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium leading-relaxed">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 rounded hover:bg-white/20 p-1 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}