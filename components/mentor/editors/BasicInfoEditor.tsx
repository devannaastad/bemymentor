"use client";

import { Card, CardContent } from "@/components/common/Card";
import { Mentor } from "@prisma/client";
import { useProfileEditor } from "../ProfileEditorContext";
import MentorAvatarUploader from "../MentorAvatarUploader";
import { Twitter, Linkedin, Globe, Youtube, Github, Instagram, Facebook } from "lucide-react";

interface BasicInfoEditorProps {
  mentor: Mentor;
}

export default function BasicInfoEditor({ mentor }: BasicInfoEditorProps) {
  const { profileData, updateField } = useProfileEditor();

  // Parse socialLinks from JSON
  const socialLinks = (profileData.socialLinks || mentor.socialLinks || {}) as Record<string, string>;

  const updateSocialLink = (platform: string, value: string) => {
    const updated = { ...socialLinks, [platform]: value };
    // Remove empty values
    if (!value) delete updated[platform];
    updateField("socialLinks", updated);
  };

  return (
    <div className="space-y-6">
      {/* Profile Image */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">Profile Photo</h3>
          <MentorAvatarUploader initialUrl={profileData.profileImage || mentor.profileImage} />
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
                value={profileData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
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
                value={profileData.tagline || ""}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="e.g., Ex-Google Engineer • 10 years experience"
                maxLength={100}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <p className="mt-1 text-xs text-white/50">
                {(profileData.tagline || "").length}/100 characters
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Bio
              </label>
              <textarea
                value={profileData.bio || ""}
                onChange={(e) => updateField("bio", e.target.value)}
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
                value={profileData.skills || ""}
                onChange={(e) => updateField("skills", e.target.value)}
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

      {/* Social Links */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">Social Links</h3>
          <p className="mb-4 text-sm text-white/60">
            Add at least one social link to complete your profile
          </p>
          <div className="space-y-3">
            {/* Twitter */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Twitter className="h-4 w-4" />
                Twitter / X
              </label>
              <input
                type="url"
                value={socialLinks.twitter || ""}
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </label>
              <input
                type="url"
                value={socialLinks.linkedin || ""}
                onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Youtube className="h-4 w-4" />
                YouTube
              </label>
              <input
                type="url"
                value={socialLinks.youtube || ""}
                onChange={(e) => updateSocialLink("youtube", e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </label>
              <input
                type="url"
                value={socialLinks.tiktok || ""}
                onChange={(e) => updateSocialLink("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@yourusername"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Instagram className="h-4 w-4" />
                Instagram
              </label>
              <input
                type="url"
                value={socialLinks.instagram || ""}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="https://instagram.com/yourusername"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Facebook className="h-4 w-4" />
                Facebook
              </label>
              <input
                type="url"
                value={socialLinks.facebook || ""}
                onChange={(e) => updateSocialLink("facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Github className="h-4 w-4" />
                GitHub
              </label>
              <input
                type="url"
                value={socialLinks.github || ""}
                onChange={(e) => updateSocialLink("github", e.target.value)}
                placeholder="https://github.com/yourusername"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Website */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Globe className="h-4 w-4" />
                Website
              </label>
              <input
                type="url"
                value={socialLinks.website || ""}
                onChange={(e) => updateSocialLink("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
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
                value={profileData.offerType || "BOTH"}
                onChange={(e) => updateField("offerType", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="ACCESS">Access Pass Only</option>
                <option value="TIME">Hourly Sessions Only</option>
                <option value="BOTH">Both Options</option>
              </select>
            </div>

            {/* Access Price */}
            {(profileData.offerType === "ACCESS" || profileData.offerType === "BOTH") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Access Pass Price ($)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={profileData.accessPrice && profileData.accessPrice > 0 ? profileData.accessPrice : ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    updateField("accessPrice", value === "" ? 0 : parseFloat(value) || 0);
                  }}
                  placeholder="$$$"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="mt-1 text-xs text-white/50">
                  Monthly subscription price for access pass holders
                </p>
              </div>
            )}

            {/* Hourly Rate */}
            {(profileData.offerType === "TIME" || profileData.offerType === "BOTH") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Hourly Rate ($)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={profileData.hourlyRate && profileData.hourlyRate > 0 ? profileData.hourlyRate : ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    updateField("hourlyRate", value === "" ? 0 : parseFloat(value) || 0);
                  }}
                  placeholder="$$$"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="mt-1 text-xs text-white/50">
                  Price per hour for 1-on-1 coaching sessions
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
