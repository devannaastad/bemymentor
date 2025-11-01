"use client";

import { Card, CardContent } from "@/components/common/Card";
import { Play } from "lucide-react";

interface VideoIntroSectionProps {
  videoUrl: string;
}

/**
 * Extracts the video ID and provider from various video URLs
 * Supports: YouTube, Vimeo, Loom
 */
function parseVideoUrl(url: string): { provider: string; videoId: string } | null {
  try {
    const urlObj = new URL(url);

    // YouTube patterns
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://www.youtube.com/live/VIDEO_ID
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId = "";
      if (urlObj.hostname.includes("youtu.be")) {
        // youtu.be/VIDEO_ID
        videoId = urlObj.pathname.slice(1).split("?")[0];
      } else if (urlObj.pathname.includes("/embed/")) {
        // youtube.com/embed/VIDEO_ID
        videoId = urlObj.pathname.split("/embed/")[1].split("?")[0];
      } else if (urlObj.pathname.includes("/live/")) {
        // youtube.com/live/VIDEO_ID
        videoId = urlObj.pathname.split("/live/")[1].split("?")[0];
      } else {
        // youtube.com/watch?v=VIDEO_ID
        videoId = urlObj.searchParams.get("v") || "";
      }
      if (videoId) return { provider: "youtube", videoId };
    }

    // Vimeo patterns
    // https://vimeo.com/VIDEO_ID
    // https://player.vimeo.com/video/VIDEO_ID
    if (urlObj.hostname.includes("vimeo.com")) {
      const videoId = urlObj.pathname.split("/").filter(Boolean).pop() || "";
      if (videoId) return { provider: "vimeo", videoId };
    }

    // Loom patterns
    // https://www.loom.com/share/VIDEO_ID
    // https://www.loom.com/embed/VIDEO_ID
    if (urlObj.hostname.includes("loom.com")) {
      const videoId = urlObj.pathname.split("/").filter(Boolean).pop() || "";
      if (videoId) return { provider: "loom", videoId };
    }
  } catch (error) {
    console.error("Failed to parse video URL:", error);
  }

  return null;
}

/**
 * Generates the embed URL for the video player
 */
function getEmbedUrl(provider: string, videoId: string): string {
  switch (provider) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}`;
    case "loom":
      return `https://www.loom.com/embed/${videoId}`;
    default:
      return "";
  }
}

export default function VideoIntroSection({ videoUrl }: VideoIntroSectionProps) {
  if (!videoUrl) return null;

  const videoData = parseVideoUrl(videoUrl);

  // Silently skip non-video URLs (like tracker.gg, social media links, etc.)
  if (!videoData) {
    return null;
  }

  const embedUrl = getEmbedUrl(videoData.provider, videoData.videoId);

  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <Play className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-semibold">Video Introduction</h2>
        </div>
        <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Mentor video introduction"
          />
        </div>
        <p className="mt-2 text-sm text-white/60">
          Watch this introduction to learn more about this mentor&apos;s teaching style and expertise.
        </p>
      </CardContent>
    </Card>
  );
}
