"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import { Video } from "lucide-react";
import { useProfileEditor } from "../ProfileEditorContext";

import { Mentor } from "@prisma/client";

interface VideoEditorProps {
  mentor: Mentor;
}

export default function VideoEditor({ mentor }: VideoEditorProps) {
  const { updateProfileData } = useProfileEditor();
  const [videoUrl, setVideoUrl] = useState(mentor.videoIntro || "");

  // Sync changes to context
  useEffect(() => {
    updateProfileData({
      videoIntro: videoUrl,
    });
  }, [videoUrl, updateProfileData]);

  return (
    <Card>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Video Introduction</h3>
          <p className="mt-1 text-sm text-white/60">
            Add a video introduction to help students get to know you
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <p className="mt-2 text-xs text-white/50">
              Supported platforms: YouTube, Vimeo, Loom
            </p>
          </div>

          {videoUrl && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
              <Video className="mx-auto h-12 w-12 text-white/40" />
              <p className="mt-4 text-sm text-white/60">Video preview will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
