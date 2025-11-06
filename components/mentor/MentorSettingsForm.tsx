// components/mentor/MentorSettingsForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { Gift, AlertCircle, CheckCircle, Globe, Video } from "lucide-react";
import type { Mentor } from "@prisma/client";
import { getUserFriendlyError } from "@/lib/utils/error-messages";
import { toast } from "@/components/common/Toast";

interface MentorSettingsFormProps {
  mentor: Mentor;
}

export default function MentorSettingsForm({ mentor }: MentorSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Timezone state
  const [timezone, setTimezone] = useState(mentor.timezone || "America/New_York");

  // Meeting platform state
  const [meetingPlatform, setMeetingPlatform] = useState(mentor.meetingPlatform || "generic");
  const [customMeetingLink, setCustomMeetingLink] = useState(mentor.customMeetingLink || "");
  const [autoGenerateMeetingLinks, setAutoGenerateMeetingLinks] = useState(
    mentor.autoGenerateMeetingLinks ?? true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        timezone,
        meetingPlatform,
        customMeetingLink: meetingPlatform === "custom" ? customMeetingLink : null,
        autoGenerateMeetingLinks,
      };

      console.log("[MentorSettingsForm] Sending update:", payload);

      const res = await fetch("/api/mentor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("[MentorSettingsForm] Response:", data);

      if (!res.ok || !data.ok) {
        const friendlyError = getUserFriendlyError(data.error || "Failed to update settings");
        throw new Error(friendlyError);
      }

      // Update local state with the new values from the response
      if (data.data.timezone) {
        setTimezone(data.data.timezone);
      }
      if (data.data.meetingPlatform) {
        setMeetingPlatform(data.data.meetingPlatform);
      }
      if (data.data.customMeetingLink !== undefined) {
        setCustomMeetingLink(data.data.customMeetingLink || "");
      }
      if (data.data.autoGenerateMeetingLinks !== undefined) {
        setAutoGenerateMeetingLinks(data.data.autoGenerateMeetingLinks);
      }

      const successMsg = "Settings updated successfully!";
      setSuccess(successMsg);
      toast.success(successMsg);

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Settings update error:", err);
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Timezone Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Timezone</h2>
        </div>

        <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
          <div>
            <label htmlFor="timezone" className="block text-sm font-semibold text-white mb-2">
              Your Timezone
            </label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-12 text-base"
            >
              <optgroup label="US & Canada">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="America/Adak">Hawaii-Aleutian Time (HAT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris (CET/CEST)</option>
                <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                <option value="Europe/Rome">Rome (CET/CEST)</option>
                <option value="Europe/Madrid">Madrid (CET/CEST)</option>
                <option value="Europe/Athens">Athens (EET/EEST)</option>
                <option value="Europe/Moscow">Moscow (MSK)</option>
              </optgroup>
              <optgroup label="Asia">
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Shanghai">China (CST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Seoul">Seoul (KST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
                <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
              </optgroup>
              <optgroup label="Australia & Pacific">
                <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                <option value="Australia/Melbourne">Melbourne (AEDT/AEST)</option>
                <option value="Australia/Brisbane">Brisbane (AEST)</option>
                <option value="Australia/Perth">Perth (AWST)</option>
                <option value="Pacific/Auckland">Auckland (NZDT/NZST)</option>
              </optgroup>
              <optgroup label="Americas">
                <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</option>
                <option value="America/Mexico_City">Mexico City (CST)</option>
                <option value="America/Toronto">Toronto (ET)</option>
              </optgroup>
              <optgroup label="Africa">
                <option value="Africa/Cairo">Cairo (EET)</option>
                <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                <option value="Africa/Lagos">Lagos (WAT)</option>
              </optgroup>
            </Select>
            <p className="text-sm text-white/50 mt-2">
              Your availability and bookings will be displayed in this timezone
            </p>
          </div>
        </div>
      </div>

      {/* Meeting Platform Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Video className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Meeting Platform</h2>
        </div>

          <div className="space-y-6 p-6 bg-white/5 rounded-lg border border-white/10">
            {/* Auto-generate toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <label htmlFor="autoGenerate" className="block text-sm font-semibold text-white mb-1">
                  Auto-generate meeting links
                </label>
                <p className="text-sm text-white/50">
                  Automatically create meeting links when you confirm a booking
                </p>
              </div>
              <input
                id="autoGenerate"
                type="checkbox"
                checked={autoGenerateMeetingLinks}
                onChange={(e) => setAutoGenerateMeetingLinks(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
              />
            </div>

            {/* Platform selection */}
            {autoGenerateMeetingLinks && (
              <div>
                <label htmlFor="meetingPlatform" className="block text-sm font-semibold text-white mb-2">
                  Preferred Meeting Platform
                </label>
                <Select
                  id="meetingPlatform"
                  value={meetingPlatform}
                  onChange={(e) => setMeetingPlatform(e.target.value)}
                  className="h-12 text-base"
                >
                  <option value="generic">Generic Link (Default)</option>
                  <option value="google">Google Meet Style</option>
                  <option value="zoom">Zoom Style</option>
                  <option value="custom">Use Custom Link</option>
                </Select>
                <p className="text-sm text-white/50 mt-2">
                  {meetingPlatform === "generic" && "Creates a unique meeting link for each booking"}
                  {meetingPlatform === "google" && "Creates Google Meet-style meeting links"}
                  {meetingPlatform === "zoom" && "Creates Zoom-style meeting links"}
                  {meetingPlatform === "custom" && "Use the same meeting link for all bookings"}
                </p>
              </div>
            )}

            {/* Custom link input */}
            {autoGenerateMeetingLinks && meetingPlatform === "custom" && (
              <div>
                <label htmlFor="customMeetingLink" className="block text-sm font-semibold text-white mb-2">
                  Your Meeting Link
                </label>
                <Input
                  id="customMeetingLink"
                  type="url"
                  value={customMeetingLink}
                  onChange={(e) => setCustomMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/your-room or https://zoom.us/j/your-id"
                  className="h-12 text-base"
                />
                <p className="text-sm text-white/50 mt-2">
                  This link will be shared with students when you confirm their booking
                </p>
              </div>
            )}

            {!autoGenerateMeetingLinks && (
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-sm text-amber-200">
                  You&apos;ll need to manually add a meeting link when confirming each booking
                </p>
              </div>
            )}
          </div>
      </div>

      {/* Free Sessions - Managed via Calendar */}
      {(mentor.offerType === "TIME" || mentor.offerType === "BOTH") && (
        <div className="p-6 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Gift className="h-6 w-6 text-emerald-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Free Intro Sessions</h3>
              <p className="text-white/70 mb-3">
                To offer free sessions, mark specific time slots as &quot;free&quot; in your calendar.
                This gives you full control over when you want to offer free intro sessions.
              </p>
              <a
                href="/mentor-dashboard"
                className="text-emerald-400 hover:text-emerald-300 font-medium text-sm underline"
              >
                Go to Calendar →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-rose-200">Error</p>
              <p className="text-sm text-rose-200/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-200">Success</p>
              <p className="text-sm text-emerald-200/80 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 px-8 text-base font-semibold"
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
