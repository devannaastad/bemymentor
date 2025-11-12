"use client";

import { useState } from "react";
import TimezoneSelector from "./TimezoneSelector";

interface TimezoneSettingsProps {
  initialTimezone: string;
}

export default function TimezoneSettings({ initialTimezone }: TimezoneSettingsProps) {
  const [timezone, setTimezone] = useState(initialTimezone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSaveTimezone = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/timezone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage({ type: "success", text: "Timezone updated successfully!" });
        // Refresh the page after a short delay to update all displayed times
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update timezone" });
      }
    } catch (error) {
      console.error("Failed to save timezone:", error);
      setMessage({ type: "error", text: "Failed to save timezone. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Set your timezone to ensure booking times are displayed correctly. All times on the site
        will be converted to your selected timezone.
      </p>

      <TimezoneSelector
        value={timezone}
        onChange={setTimezone}
        onDetectTimezone={() => {
          setMessage({ type: "success", text: "Timezone auto-detected! Click Save to apply." });
        }}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleSaveTimezone}
          disabled={saving || timezone === initialTimezone}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-white/10 disabled:text-white/40 text-black font-semibold rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Current Time Preview */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-semibold text-white mb-2">Current Time in {timezone}</h3>
        <p className="text-white/60">
          {new Date().toLocaleString("en-US", {
            timeZone: timezone,
            dateStyle: "full",
            timeStyle: "long",
          })}
        </p>
      </div>
    </div>
  );
}
