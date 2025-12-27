"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import { Mentor, MentorCategory } from "@prisma/client";
import { useProfileEditor } from "../ProfileEditorContext";
import MentorAvatarUploader from "../MentorAvatarUploader";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import { Twitter, Linkedin, Globe, Youtube, Github, Instagram, Facebook, CheckCircle, AlertCircle, ExternalLink, DollarSign } from "lucide-react";
import { CATEGORY_LABELS, getCategoryIcon } from "@/lib/utils/categories";

interface BasicInfoEditorProps {
  mentor: Mentor;
}

export default function BasicInfoEditor({ mentor }: BasicInfoEditorProps) {
  const { profileData, updateField } = useProfileEditor();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(mentor.stripeOnboarded || false);
  const [hasAccount, setHasAccount] = useState(!!mentor.stripeConnectId);

  // Parse socialLinks from JSON
  const socialLinks = (profileData.socialLinks || mentor.socialLinks || {}) as Record<string, string>;

  const updateSocialLink = (platform: string, value: string) => {
    const updated = { ...socialLinks, [platform]: value };
    // Remove empty values
    if (!value) delete updated[platform];
    updateField("socialLinks", updated);
  };

  // Check Stripe onboarding status
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  async function checkOnboardingStatus() {
    setChecking(true);
    try {
      const res = await fetch("/api/mentor/stripe-connect");
      const data = await res.json();

      if (data.ok) {
        setHasAccount(data.data.hasAccount);
        setIsOnboarded(data.data.isOnboarded);
      }
    } catch (err) {
      console.error("Failed to check onboarding status:", err);
    } finally {
      setChecking(false);
    }
  }

  async function handleConnectStripe() {
    setLoading(true);
    try {
      const res = await fetch("/api/mentor/stripe-connect", {
        method: "POST",
      });

      const data = await res.json();

      if (data.ok && data.data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.data.url;
      } else {
        // Show specific error message if available
        if (data.configError) {
          alert(
            "⚠️ Stripe Configuration Required\n\n" +
            "The platform owner needs to complete Stripe setup first. " +
            "Please contact support or try again later.\n\n" +
            "Admin: Visit https://dashboard.stripe.com/settings/connect/platform-profile to complete setup."
          );
        } else {
          alert(data.error || "Failed to create Stripe account. Please try again.");
        }
      }
    } catch (err) {
      console.error("Failed to connect Stripe:", err);
      alert("Failed to connect Stripe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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

            {/* Categories (Multi-select) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Categories
              </label>
              <div className="space-y-2">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
                  const categories = profileData.categories || mentor.categories || [];
                  const isSelected = categories.includes(value as MentorCategory);

                  return (
                    <label
                      key={value}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentCategories = profileData.categories || mentor.categories || [];
                          let newCategories: MentorCategory[];

                          if (e.target.checked) {
                            // Add category
                            newCategories = [...currentCategories, value as MentorCategory];
                          } else {
                            // Remove category
                            newCategories = currentCategories.filter((c) => c !== value);
                          }

                          updateField("categories", newCategories);
                        }}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="flex items-center gap-2 text-sm">
                        <span>{getCategoryIcon(value as MentorCategory)}</span>
                        <span className="font-medium">{label}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-white/50">
                Select all categories that apply to your mentoring. This helps users find you when filtering the catalog.
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

      {/* Stripe Connect / Payment Setup */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">Payment Setup</h3>
          {checking ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
              <p className="mt-3 text-sm text-white/60">Checking payment setup status...</p>
            </div>
          ) : (
            <div
              className={`rounded-lg border p-6 ${
                isOnboarded
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : "border-amber-500/20 bg-amber-500/10"
              }`}
            >
              <div className="flex items-start gap-4">
                {isOnboarded ? (
                  <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">
                    {isOnboarded
                      ? "Payment Setup Complete!"
                      : hasAccount
                      ? "Complete Your Stripe Onboarding"
                      : "Connect Your Stripe Account"}
                  </h4>
                  <p className="text-sm text-white/70 mb-4">
                    {isOnboarded
                      ? "Your Stripe account is fully set up. You can now receive payments from your mentees."
                      : hasAccount
                      ? "You've started the Stripe onboarding process but haven't completed it yet. Click below to continue."
                      : "Connect your Stripe account to receive payments. We charge a 15% platform fee, you keep 85%."}
                  </p>

                  {!isOnboarded && (
                    <Button
                      onClick={handleConnectStripe}
                      disabled={loading}
                      variant="primary"
                      className="gap-2"
                    >
                      {loading ? (
                        "Loading..."
                      ) : hasAccount ? (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Continue Stripe Setup
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4" />
                          Connect Stripe Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
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
              <Select
                value={profileData.offerType || "BOTH"}
                onChange={(e) => updateField("offerType", e.target.value)}
              >
                <option value="ACCESS">Access Pass Only</option>
                <option value="TIME">Hourly Sessions Only</option>
                <option value="BOTH">Both Options</option>
              </Select>
            </div>

            {/* Access Price */}
            {(profileData.offerType === "ACCESS" || profileData.offerType === "BOTH") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Access Pass Price ($)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={profileData.accessPrice !== undefined && profileData.accessPrice !== null ? String(profileData.accessPrice) : ""}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Remove any non-numeric characters except decimal point
                    value = value.replace(/[^0-9.]/g, "");

                    // Prevent multiple decimal points
                    const decimalCount = (value.match(/\./g) || []).length;
                    if (decimalCount > 1) {
                      return; // Don't update if trying to add more than one decimal
                    }

                    // Allow empty, just decimal, or valid decimal numbers
                    if (value === "" || value === "0" || value === "." || value === "0.") {
                      updateField("accessPrice", value);
                    } else if (/^\d*\.?\d*$/.test(value)) {
                      // Valid number format - keep as string for display, will parse on blur
                      updateField("accessPrice", value);
                    }
                  }}
                  onBlur={(e) => {
                    // Clean up and convert to number on blur
                    let value = e.target.value.replace(/[^0-9.]/g, "");

                    // Remove trailing decimal point
                    if (value.endsWith(".")) {
                      value = value.slice(0, -1);
                    }

                    // Convert to number or 0 if empty
                    const numValue = value === "" ? 0 : parseFloat(value);
                    updateField("accessPrice", numValue);
                  }}
                  placeholder="49.99"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="mt-1 text-xs text-white/50">
                  Monthly subscription price for access pass holders (minimum $0.50)
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
                  inputMode="decimal"
                  value={profileData.hourlyRate !== undefined && profileData.hourlyRate !== null ? String(profileData.hourlyRate) : ""}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Remove any non-numeric characters except decimal point
                    value = value.replace(/[^0-9.]/g, "");

                    // Prevent multiple decimal points
                    const decimalCount = (value.match(/\./g) || []).length;
                    if (decimalCount > 1) {
                      return; // Don't update if trying to add more than one decimal
                    }

                    // Allow empty, just decimal, or valid decimal numbers
                    if (value === "" || value === "0" || value === "." || value === "0.") {
                      updateField("hourlyRate", value);
                    } else if (/^\d*\.?\d*$/.test(value)) {
                      // Valid number format - keep as string for display, will parse on blur
                      updateField("hourlyRate", value);
                    }
                  }}
                  onBlur={(e) => {
                    // Clean up and convert to number on blur
                    let value = e.target.value.replace(/[^0-9.]/g, "");

                    // Remove trailing decimal point
                    if (value.endsWith(".")) {
                      value = value.slice(0, -1);
                    }

                    // Convert to number or 0 if empty
                    const numValue = value === "" ? 0 : parseFloat(value);
                    updateField("hourlyRate", numValue);
                  }}
                  placeholder="75.00"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="mt-1 text-xs text-white/50">
                  Price per hour for 1-on-1 coaching sessions (minimum $0.50)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
