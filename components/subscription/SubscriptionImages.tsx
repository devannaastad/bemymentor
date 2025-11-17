"use client";

import { Card, CardContent } from "@/components/common/Card";
import { Image as ImageIcon } from "lucide-react";

interface ImageItem {
  url: string;
  caption?: string;
}

interface SubscriptionImagesProps {
  images: ImageItem[];
}

export default function SubscriptionImages({ images }: SubscriptionImagesProps) {
  if (images.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-pink-400" />
          <h3 className="text-xl font-semibold">Images & Resources</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((image, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <img
                src={image.url}
                alt={image.caption || `Resource ${idx + 1}`}
                className="mb-3 w-full rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {image.caption && (
                <p className="text-sm text-white/70">{image.caption}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
