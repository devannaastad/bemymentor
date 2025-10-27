"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Image from "next/image";
import { Camera } from "lucide-react";

import { Mentor } from "@prisma/client";

interface BasicInfoEditorProps {
  mentor: Mentor;
}

export default function BasicInfoEditor({ mentor }: BasicInfoEditorProps) {
  const [formData, setFormData] = useState({
    name: mentor.name || "",
    tagline: mentor.tagline || "",
    bio: mentor.bio || "",
    category: mentor.category || "",
    offerType: mentor.offerType || "BOTH",
    accessPrice: mentor.accessPrice ? mentor.accessPrice / 100 : 0,
    hourlyRate: mentor.hourlyRate ? mentor.hourlyRate / 100 : 0,
    skills: (mentor.skills || []).join(", "),
    profileImage: mentor.profileImage || "",
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Image */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">Profile Photo</h3>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 overflow-hidden rounded-full bg-white/10">
              {formData.profileImage ? (
                <Image
                  src={formData.profileImage}
                  alt={formData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/50">
                  <Camera className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-white/80">
                Profile Image URL
              </label>
              <input
                type="url"
                value={formData.profileImage}
                onChange={(e) => handleChange("profileImage", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <p className="mt-2 text-xs text-white/50">
                Enter a URL to your profile image or upload through UploadThing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="e.g., Ex-Google Engineer • 10 years experience"
                maxLength={100}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <p className="mt-1 text-xs text-white/50">
                {formData.tagline.length}/100 characters
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell students about your background, experience, and what you can teach them..."
                rows={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                placeholder="Bitcoin, Technical Analysis, Risk Management"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <p className="mt-1 text-xs text-white/50">
                Separate skills with commas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">Pricing</h3>
          <div className="space-y-4">
            {/* Offer Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Offer Type
              </label>
              <select
                value={formData.offerType}
                onChange={(e) => handleChange("offerType", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="ACCESS">Access Pass Only</option>
                <option value="TIME">Hourly Sessions Only</option>
                <option value="BOTH">Both Options</option>
              </select>
            </div>

            {/* Access Price */}
            {(formData.offerType === "ACCESS" || formData.offerType === "BOTH") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Access Pass Price ($)
                </label>
                <input
                  type="number"
                  value={formData.accessPrice}
                  onChange={(e) => handleChange("accessPrice", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                  placeholder="49"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            )}

            {/* Hourly Rate */}
            {(formData.offerType === "TIME" || formData.offerType === "BOTH") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleChange("hourlyRate", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                  placeholder="200"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
