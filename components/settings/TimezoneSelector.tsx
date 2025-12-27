"use client";

import { useState, useEffect } from "react";
import Select from "@/components/common/Select";

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  onDetectTimezone?: () => void;
}

// Common timezones organized by region
const TIMEZONES = {
  "US & Canada": [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Phoenix", label: "Mountain Time - Arizona (no DST)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  ],
  Europe: [
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Paris (CET/CEST)" },
    { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
    { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
    { value: "Europe/Rome", label: "Rome (CET/CEST)" },
    { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)" },
    { value: "Europe/Brussels", label: "Brussels (CET/CEST)" },
    { value: "Europe/Vienna", label: "Vienna (CET/CEST)" },
    { value: "Europe/Warsaw", label: "Warsaw (CET/CEST)" },
    { value: "Europe/Athens", label: "Athens (EET/EEST)" },
    { value: "Europe/Moscow", label: "Moscow (MSK)" },
  ],
  Asia: [
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
    { value: "Asia/Shanghai", label: "China (CST)" },
    { value: "Asia/Tokyo", label: "Japan (JST)" },
    { value: "Asia/Seoul", label: "South Korea (KST)" },
  ],
  Australia: [
    { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
    { value: "Australia/Melbourne", label: "Melbourne (AEDT/AEST)" },
    { value: "Australia/Brisbane", label: "Brisbane (AEST)" },
    { value: "Australia/Perth", label: "Perth (AWST)" },
  ],
  "Other": [
    { value: "Pacific/Auckland", label: "Auckland, New Zealand (NZDT/NZST)" },
    { value: "America/Sao_Paulo", label: "São Paulo, Brazil (BRT)" },
    { value: "America/Mexico_City", label: "Mexico City (CST/CDT)" },
    { value: "America/Toronto", label: "Toronto, Canada (ET)" },
    { value: "America/Vancouver", label: "Vancouver, Canada (PT)" },
  ],
};

export default function TimezoneSelector({
  value,
  onChange,
  onDetectTimezone,
}: TimezoneSelectorProps) {
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);

  useEffect(() => {
    // Automatically detect user's timezone on mount
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTimezone(detected);
  }, []);

  const handleAutoDetect = () => {
    if (detectedTimezone) {
      onChange(detectedTimezone);
      if (onDetectTimezone) {
        onDetectTimezone();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        >
          {Object.entries(TIMEZONES).map(([region, timezones]) => (
            <optgroup key={region} label={region}>
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>

        <button
          type="button"
          onClick={handleAutoDetect}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg transition-colors whitespace-nowrap"
          title={detectedTimezone ? `Detected: ${detectedTimezone}` : "Auto-detect timezone"}
        >
          Auto-Detect
        </button>
      </div>

      {detectedTimezone && detectedTimezone !== value && (
        <p className="text-sm text-white/60">
          Detected timezone: <span className="text-primary-500">{detectedTimezone}</span>
        </p>
      )}
    </div>
  );
}
