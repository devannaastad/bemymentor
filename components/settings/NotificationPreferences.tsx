// components/settings/NotificationPreferences.tsx
"use client";

import { useState } from "react";
import Toggle from "@/components/common/Toggle";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";

// Default notification preferences (stored in localStorage for now)
const DEFAULT_PREFS = {
  emailBookingConfirmation: true,
  emailSessionReminder24h: true,
  emailSessionReminder1h: true,
  emailSessionReminder15min: true,
  emailMeetingLinkAdded: true,
  emailBookingUpdate: true,
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
      <p className="text-sm text-white/60">
        Customize which email notifications you receive. You&apos;ll still see in-app notifications for all activities.
      </p>

      <div className="space-y-6">
        {/* Booking & Session Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Bookings & Sessions</h3>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-white/90">Booking Confirmations</p>
              <p className="text-sm text-white/60">
                Get notified when a booking is confirmed and payment is processed
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
              <p className="font-medium text-white/90">24-Hour Session Reminder</p>
              <p className="text-sm text-white/60">
                Reminder email 24 hours before your session starts
              </p>
            </div>
            <Toggle
              checked={prefs.emailSessionReminder24h}
              onChange={() => handleToggle("emailSessionReminder24h")}
              label="24-hour reminder toggle"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-white/90">1-Hour Session Reminder</p>
              <p className="text-sm text-white/60">
                Reminder email 1 hour before your session starts
              </p>
            </div>
            <Toggle
              checked={prefs.emailSessionReminder1h}
              onChange={() => handleToggle("emailSessionReminder1h")}
              label="1-hour reminder toggle"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-white/90">15-Minute Session Reminder</p>
              <p className="text-sm text-white/60">
                Final reminder 15 minutes before your session starts
              </p>
            </div>
            <Toggle
              checked={prefs.emailSessionReminder15min}
              onChange={() => handleToggle("emailSessionReminder15min")}
              label="15-minute reminder toggle"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-white/90">Meeting Link Updates</p>
              <p className="text-sm text-white/60">
                Get notified when a mentor adds or updates the meeting link
              </p>
            </div>
            <Toggle
              checked={prefs.emailMeetingLinkAdded}
              onChange={() => handleToggle("emailMeetingLinkAdded")}
              label="Meeting link updates toggle"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-white/90">Booking Updates</p>
              <p className="text-sm text-white/60">
                Other booking changes (reschedules, cancellations, etc.)
              </p>
            </div>
            <Toggle
              checked={prefs.emailBookingUpdate}
              onChange={() => handleToggle("emailBookingUpdate")}
              label="Booking updates toggle"
            />
          </div>
        </div>

        {/* Other Notifications */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Other</h3>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-white/90">Mentor Application Updates</p>
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
              <p className="font-medium text-white/90">Marketing & Product Updates</p>
              <p className="text-sm text-white/60">
                Receive newsletters, new features, and special offers
              </p>
            </div>
            <Toggle
              checked={prefs.emailMarketingUpdates}
              onChange={() => handleToggle("emailMarketingUpdates")}
              label="Marketing updates toggle"
            />
          </div>
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
