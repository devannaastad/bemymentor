// components/settings/NotificationPreferences.tsx
"use client";

import { useState } from "react";
import Toggle from "@/components/common/Toggle";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";

// Default notification preferences (stored in localStorage for now)
const DEFAULT_PREFS = {
  emailBookingConfirmation: true,
  emailBookingReminder: true,
  emailApplicationUpdates: true,
  emailMarketingUpdates: false,
};

type Prefs = typeof DEFAULT_PREFS;

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFS;

    try {
      const stored = localStorage.getItem("notificationPrefs");
      return stored ? (JSON.parse(stored) as Prefs) : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof Prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("notificationPrefs", JSON.stringify(prefs));
      toast("Notification preferences saved", "success");
      setHasChanges(false);
    } catch (err) {
      console.error("[NotificationPreferences] Save failed:", err);
      toast("Failed to save preferences", "error");
    }
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFS);
    setHasChanges(true);
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-white/90">Booking Confirmations</p>
            <p className="text-sm text-white/60">
              Get notified when a booking is confirmed
            </p>
          </div>
          <Toggle
            checked={prefs.emailBookingConfirmation}
            onChange={() => handleToggle("emailBookingConfirmation")}
            label="Booking confirmations toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-white/90">Booking Reminders</p>
            <p className="text-sm text-white/60">
              Receive reminders 24 hours before your sessions
            </p>
          </div>
          <Toggle
            checked={prefs.emailBookingReminder}
            onChange={() => handleToggle("emailBookingReminder")}
            label="Booking reminders toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-white/90">Application Updates</p>
            <p className="text-sm text-white/60">
              Get updates about your mentor application status
            </p>
          </div>
          <Toggle
            checked={prefs.emailApplicationUpdates}
            onChange={() => handleToggle("emailApplicationUpdates")}
            label="Application updates toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-white/90">Marketing Updates</p>
            <p className="text-sm text-white/60">
              Receive newsletters and product updates
            </p>
          </div>
          <Toggle
            checked={prefs.emailMarketingUpdates}
            onChange={() => handleToggle("emailMarketingUpdates")}
            label="Marketing updates toggle"
          />
        </div>
      </div>

      {hasChanges && (
        <div className="flex gap-3">
          <Button onClick={handleSave} variant="primary">
            Save Preferences
          </Button>
          <Button onClick={handleReset} variant="ghost">
            Reset to Defaults
          </Button>
        </div>
      )}

      <p className="text-xs text-white/50">
        Note: Email notifications are currently stored locally. They will be synced to your account in a future update.
      </p>
    </div>
  );
}
