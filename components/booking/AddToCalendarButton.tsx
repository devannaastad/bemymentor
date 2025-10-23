"use client";

import { Calendar } from "lucide-react";
import Button from "@/components/common/Button";

interface AddToCalendarButtonProps {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  mentorName: string;
}

export default function AddToCalendarButton({
  title,
  description,
  location,
  startTime,
  endTime,
  mentorName,
}: AddToCalendarButtonProps) {
  const formatICSDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const generateICS = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BeMyMentor//Booking//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(startTime)}`,
      `DTEND:${formatICSDate(endTime)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `ORGANIZER;CN=${mentorName}:MAILTO:noreply@bemymentor.com`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: Session with " + mentorName + " in 30 minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return icsContent;
  };

  const downloadICS = () => {
    const icsContent = generateICS();
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `session-${mentorName.replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addToGoogleCalendar = () => {
    const googleUrl = new URL("https://calendar.google.com/calendar/render");
    googleUrl.searchParams.set("action", "TEMPLATE");
    googleUrl.searchParams.set("text", title);
    googleUrl.searchParams.set("details", description);
    googleUrl.searchParams.set("location", location);
    googleUrl.searchParams.set("dates", `${formatICSDate(startTime)}/${formatICSDate(endTime)}`);

    window.open(googleUrl.toString(), "_blank");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={addToGoogleCalendar}
        variant="primary"
        className="flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Add to Google Calendar
      </Button>
      <Button
        onClick={downloadICS}
        variant="secondary"
        className="flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Download Calendar File
      </Button>
    </div>
  );
}
