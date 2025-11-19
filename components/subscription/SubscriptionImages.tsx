"use client";

import { Card, CardContent } from "@/components/common/Card";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

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
              <div className="relative mb-3 w-full aspect-video">
                <Image
                  src={image.url}
                  alt={image.caption || `Resource ${idx + 1}`}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
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
