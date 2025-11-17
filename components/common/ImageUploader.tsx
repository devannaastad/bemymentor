// components/common/ImageUploader.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "@/components/common/Toast";
import { Upload, X, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import Button from "@/components/common/Button";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  onRemove?: () => void;
  label?: string;
  description?: string;
}

export default function ImageUploader({
  onUploadComplete,
  currentImageUrl,
  onRemove,
  label = "Upload Image",
  description = "JPG, PNG or GIF. Max size 4MB.",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        const url = res[0].url;
        setPreviewUrl(url);
        onUploadComplete(url);
        toast.success("Image uploaded successfully!");
        setUploading(false);
      }
    },
    onUploadError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be less than 4MB");
      return;
    }

    setUploading(true);
    await startUpload([file]);
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 rounded-lg border border-white/10 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              setPreviewUrl(undefined);
            }}
          />
          {onRemove && (
            <button
              onClick={handleRemove}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          size="sm"
          disabled={uploading}
          className="flex items-center gap-2"
          type="button"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {label}
            </>
          )}
        </Button>

        {description && !uploading && (
          <p className="text-xs text-white/50">{description}</p>
        )}
      </div>
    </div>
  );
}
