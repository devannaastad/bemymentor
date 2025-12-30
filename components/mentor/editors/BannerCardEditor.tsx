// components/mentor/editors/BannerCardEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import { X, Image as ImageIcon, Video, MoveUp, MoveDown, Sparkles } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { useProfileEditor } from "../ProfileEditorContext";
import type { Mentor } from "@prisma/client";

type MediaItem = {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
};

interface BannerCardEditorProps {
  mentor: Mentor;
}

export default function BannerCardEditor({ mentor }: BannerCardEditorProps) {
  const { updateProfileData } = useProfileEditor();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [tagline, setTagline] = useState("");

  // Initialize from mentor data
  useEffect(() => {
    const bannerMedia = (mentor.bannerMedia as unknown as MediaItem[]) || [];
    setMedia(bannerMedia);
    setTagline(mentor.bannerTagline || "");
  }, [mentor]);

  // Update profile data whenever media or tagline changes
  useEffect(() => {
    updateProfileData({
      bannerMedia: media,
      bannerTagline: tagline,
    });
  }, [media, tagline, updateProfileData]);

  const addMedia = (type: "image" | "video", url: string, thumbnail?: string) => {
    setMedia([...media, { type, url, thumbnail }]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const moveMedia = (index: number, direction: "up" | "down") => {
    const newMedia = [...media];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= media.length) return;

    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    setMedia(newMedia);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold">Banner Card Content</h2>
            </div>
            <p className="text-sm text-white/60">
              Customize the banner section of your mentor card that appears in the catalog. Add eye-catching media and a bold tagline to attract more students!
            </p>
          </div>

          {/* Tagline Input */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium text-white">
              Banner Tagline
            </label>
            <p className="mb-3 text-sm text-white/60">
              Add a bold, catchy phrase that will appear on your mentor card. Examples: &quot;JOIN NOW TO LEVEL UP&quot;, &quot;MASTER CRYPTO TRADING IN 30 DAYS&quot;, &quot;GET RADIANT IN 2 WEEKS&quot;
            </p>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g., JOIN NOW TO LEVEL UP"
              maxLength={100}
              className="w-full rounded-lg border-2 border-white/20 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-purple-500 placeholder:text-white/30"
            />
            <p className="mt-1 text-xs text-white/50">{tagline.length}/100 characters</p>
          </div>

          {/* Media Upload Section */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Banner Media (Photos & Videos)
            </label>
            <p className="mb-4 text-sm text-white/60">
              Add photos and videos to showcase your expertise. Students can swipe through them on your mentor card. Videos will not autoplay - students click to watch.
            </p>

            {/* Media List */}
            {media.length > 0 && (
              <div className="mb-4 space-y-3">
                {media.map((item, index) => (
                  <Card key={index} className="border-white/10 bg-white/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Preview */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/10">
                          {item.type === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.url}
                              alt={`Media ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Video className="h-8 w-8 text-purple-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {item.type === "image" ? (
                              <ImageIcon className="h-4 w-4 text-white/60" />
                            ) : (
                              <Video className="h-4 w-4 text-white/60" />
                            )}
                            <span className="text-sm capitalize text-white/80">{item.type}</span>
                          </div>
                          <p className="mt-1 truncate text-xs text-white/50">{item.url}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveMedia(index, "up")}
                            disabled={index === 0}
                            className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30"
                            title="Move up"
                          >
                            <MoveUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveMedia(index, "down")}
                            disabled={index === media.length - 1}
                            className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30"
                            title="Move down"
                          >
                            <MoveDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeMedia(index)}
                            className="rounded p-1 text-red-400 hover:bg-red-500/10"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            <div className="flex flex-wrap gap-3">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    addMedia("image", res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Upload error: ${error.message}`);
                }}
                appearance={{
                  button: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ut-ready:bg-purple-600 ut-uploading:bg-purple-700",
                  allowedContent: "hidden",
                }}
                content={{
                  button: (
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Add Photo
                    </span>
                  ),
                }}
              />

              <UploadButton
                endpoint="videoUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    addMedia("video", res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Upload error: ${error.message}`);
                }}
                appearance={{
                  button: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ut-ready:bg-purple-600 ut-uploading:bg-purple-700",
                  allowedContent: "hidden",
                }}
                content={{
                  button: (
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Add Video
                    </span>
                  ),
                }}
              />
            </div>

            {media.length === 0 && (
              <p className="mt-4 text-sm text-white/50">
                No media added yet. Add photos or videos to make your card stand out in the catalog!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(media.length > 0 || tagline) && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-6">
            <h3 className="mb-3 text-sm font-semibold text-purple-300">Preview</h3>
            <p className="mb-4 text-xs text-white/60">
              This is how your banner will appear on your mentor card
            </p>
            <div className="rounded-lg border border-white/10 bg-black/40 p-4">
              {media.length > 0 && (
                <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-white/5">
                  {media[0].type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media[0].url} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Video className="h-12 w-12 text-purple-400" />
                      <p className="ml-2 text-sm text-white/60">Video Preview</p>
                    </div>
                  )}
                </div>
              )}
              {tagline && (
                <p className="text-center text-lg font-bold text-white">{tagline}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
