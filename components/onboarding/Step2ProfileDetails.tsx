"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import Input from "@/components/common/Input";
import FormFieldError from "@/components/common/FormFieldError";
import { Upload } from "lucide-react";

interface Step2ProfileDetailsProps {
  initialData?: {
    bio?: string;
    profileImage?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      website?: string;
      youtube?: string;
    };
  };
  onNext: (data: {
    bio: string;
    profileImage: string;
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      website?: string;
      youtube?: string;
    };
  }) => void;
  onBack: () => void;
}

export default function Step2ProfileDetails({
  initialData,
  onNext,
  onBack,
}: Step2ProfileDetailsProps) {
  const [bio, setBio] = useState(initialData?.bio || "");
  const [profileImage, setProfileImage] = useState(initialData?.profileImage || "");
  const [twitter, setTwitter] = useState(initialData?.socialLinks?.twitter || "");
  const [linkedin, setLinkedin] = useState(initialData?.socialLinks?.linkedin || "");
  const [website, setWebsite] = useState(initialData?.socialLinks?.website || "");
  const [youtube, setYoutube] = useState(initialData?.socialLinks?.youtube || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!bio.trim()) {
      setError("Bio is required");
      return;
    }

    if (bio.length < 50) {
      setError("Bio must be at least 50 characters");
      return;
    }

    if (!profileImage.trim()) {
      setError("Profile image URL is required");
      return;
    }

    // Basic URL validation for profile image
    try {
      new URL(profileImage);
    } catch {
      setError("Please provide a valid profile image URL");
      return;
    }

    onNext({
      bio: bio.trim(),
      profileImage: profileImage.trim(),
      socialLinks: {
        twitter: twitter.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        website: website.trim() || undefined,
        youtube: youtube.trim() || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Details</h2>
        <p className="text-white/60">
          Tell students about yourself and add links to your online presence.
        </p>
      </div>

      <div className="space-y-4">
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-2">
            Bio *
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your experience, achievements, and what makes you a great mentor..."
            rows={6}
            maxLength={2000}
          />
          <p className="text-xs text-white/40 mt-1">
            {bio.length}/2000 characters (minimum 50)
          </p>
        </div>

        {/* Profile Image */}
        <div>
          <label htmlFor="profileImage" className="block text-sm font-medium text-white/80 mb-2">
            Profile Image URL *
          </label>
          <div className="flex gap-2">
            <Input
              id="profileImage"
              type="url"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
            />
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="shrink-0"
              title="Upload to an image host like Imgur, then paste the URL here"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Upload your photo to an image host (e.g., Imgur) and paste the URL here
          </p>
          {profileImage && (
            <div className="mt-2">
              <Image
                src={profileImage}
                alt="Profile preview"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3">
            Social Links (Optional)
          </h3>
          <div className="space-y-3">
            <Input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="Twitter/X Profile URL"
            />
            <Input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="LinkedIn Profile URL"
            />
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Personal Website URL"
            />
            <Input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="YouTube Channel URL"
            />
          </div>
        </div>
      </div>

      {error && <FormFieldError error={error} />}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Continue
        </Button>
      </div>
    </form>
  );
}
