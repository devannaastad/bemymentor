// components/mentor/MentorSettingsForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { DollarSign, Gift, AlertCircle, CheckCircle, Globe } from "lucide-react";
import type { Mentor } from "@prisma/client";
import { getUserFriendlyError, ERROR_MESSAGES } from "@/lib/utils/error-messages";
import { toast } from "@/components/common/Toast";

interface MentorSettingsFormProps {
  mentor: Mentor;
}

export default function MentorSettingsForm({ mentor }: MentorSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pricing state
  const [accessPrice, setAccessPrice] = useState(
    mentor.accessPrice ? (mentor.accessPrice / 100).toString() : ""
  );
  const [hourlyRate, setHourlyRate] = useState(
    mentor.hourlyRate ? (mentor.hourlyRate / 100).toString() : ""
  );

  // Timezone state
  const [timezone, setTimezone] = useState(mentor.timezone || "America/New_York");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Client-side validation
    if (accessPrice && parseFloat(accessPrice) <= 0) {
      setError(ERROR_MESSAGES.INVALID_PRICE);
      setLoading(false);
      toast.error(ERROR_MESSAGES.INVALID_PRICE);
      return;
    }

    if (hourlyRate && parseFloat(hourlyRate) <= 0) {
      setError(ERROR_MESSAGES.INVALID_PRICE);
      setLoading(false);
      toast.error(ERROR_MESSAGES.INVALID_PRICE);
      return;
    }

    try {
      const payload = {
        accessPrice: accessPrice ? Math.round(parseFloat(accessPrice) * 100) : null,
        hourlyRate: hourlyRate ? Math.round(parseFloat(hourlyRate) * 100) : null,
        timezone,
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
      if (data.data.hourlyRate !== null) {
        setHourlyRate((data.data.hourlyRate / 100).toString());
      }
      if (data.data.accessPrice !== null) {
        setAccessPrice((data.data.accessPrice / 100).toString());
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
      {/* Pricing Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-6 w-6 text-amber-400" />
          <h2 className="text-2xl font-bold">Pricing</h2>
        </div>

        <div className="space-y-6 p-6 bg-white/5 rounded-lg border border-white/10">
          {(mentor.offerType === "ACCESS" || mentor.offerType === "BOTH") && (
            <div>
              <label htmlFor="accessPrice" className="block text-sm font-semibold text-white mb-2">
                ACCESS Pass Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
                  $
                </span>
                <Input
                  id="accessPrice"
                  type="number"
                  step="0.01"
                  min="1"
                  value={accessPrice}
                  onChange={(e) => setAccessPrice(e.target.value)}
                  placeholder="49.99"
                  className="h-12 text-base pl-8"
                />
              </div>
              <p className="text-sm text-white/50 mt-2">
                One-time payment for ongoing access to your content/community
              </p>
            </div>
          )}

          {(mentor.offerType === "TIME" || mentor.offerType === "BOTH") && (
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-semibold text-white mb-2">
                Hourly Rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
                  $
                </span>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  min="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="99.99"
                  className="h-12 text-base pl-8"
                />
              </div>
              <p className="text-sm text-white/50 mt-2">
                Price per hour for 1-on-1 coaching sessions
              </p>
            </div>
          )}
        </div>
      </div>

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
