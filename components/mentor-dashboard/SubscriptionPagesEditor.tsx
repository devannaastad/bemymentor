"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";
import { Plus, Trash2, Eye, Save, ChevronDown, ChevronUp, Image as ImageIcon, Video } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import ImageUploader from "@/components/common/ImageUploader";

interface AccessLink {
  title: string;
  url: string;
}

interface VideoItem {
  title: string;
  url: string;
  description?: string;
}

interface ImageItem {
  url: string;
  caption?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  welcomeMessage?: string | null;
  accessLinks?: unknown;
  pageContent?: string | null;
  pageVideos?: unknown;
  pageImages?: unknown;
}

interface SubscriptionPagesEditorProps {
  mentorId: string;
  plans: SubscriptionPlan[];
}

export default function SubscriptionPagesEditor({ mentorId, plans: initialPlans }: SubscriptionPagesEditorProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(initialPlans[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);

  // Links management
  const addLink = (planId: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentLinks = Array.isArray(plan.accessLinks)
          ? (plan.accessLinks as AccessLink[])
          : [];
        return {
          ...plan,
          accessLinks: [...currentLinks, { title: "", url: "" }],
        };
      }
      return plan;
    }));
  };

  const updateLink = (planId: string, linkIndex: number, field: keyof AccessLink, value: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentLinks = Array.isArray(plan.accessLinks)
          ? (plan.accessLinks as AccessLink[])
          : [];
        const updatedLinks = [...currentLinks];
        updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], [field]: value };
        return {
          ...plan,
          accessLinks: updatedLinks,
        };
      }
      return plan;
    }));
  };

  const removeLink = (planId: string, linkIndex: number) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentLinks = Array.isArray(plan.accessLinks)
          ? (plan.accessLinks as AccessLink[])
          : [];
        return {
          ...plan,
          accessLinks: currentLinks.filter((_, i) => i !== linkIndex),
        };
      }
      return plan;
    }));
  };

  // Video management
  const addVideo = (planId: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentVideos = Array.isArray(plan.pageVideos)
          ? (plan.pageVideos as VideoItem[])
          : [];
        return {
          ...plan,
          pageVideos: [...currentVideos, { title: "", url: "", description: "" }],
        };
      }
      return plan;
    }));
  };

  const updateVideo = (planId: string, videoIndex: number, field: keyof VideoItem, value: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentVideos = Array.isArray(plan.pageVideos)
          ? (plan.pageVideos as VideoItem[])
          : [];
        const updatedVideos = [...currentVideos];
        updatedVideos[videoIndex] = { ...updatedVideos[videoIndex], [field]: value };
        return {
          ...plan,
          pageVideos: updatedVideos,
        };
      }
      return plan;
    }));
  };

  const removeVideo = (planId: string, videoIndex: number) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentVideos = Array.isArray(plan.pageVideos)
          ? (plan.pageVideos as VideoItem[])
          : [];
        return {
          ...plan,
          pageVideos: currentVideos.filter((_, i) => i !== videoIndex),
        };
      }
      return plan;
    }));
  };

  // Image management
  const addImage = (planId: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentImages = Array.isArray(plan.pageImages)
          ? (plan.pageImages as ImageItem[])
          : [];
        return {
          ...plan,
          pageImages: [...currentImages, { url: "", caption: "" }],
        };
      }
      return plan;
    }));
  };

  const updateImage = (planId: string, imageIndex: number, field: keyof ImageItem, value: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentImages = Array.isArray(plan.pageImages)
          ? (plan.pageImages as ImageItem[])
          : [];
        const updatedImages = [...currentImages];
        updatedImages[imageIndex] = { ...updatedImages[imageIndex], [field]: value };
        return {
          ...plan,
          pageImages: updatedImages,
        };
      }
      return plan;
    }));
  };

  const removeImage = (planId: string, imageIndex: number) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const currentImages = Array.isArray(plan.pageImages)
          ? (plan.pageImages as ImageItem[])
          : [];
        return {
          ...plan,
          pageImages: currentImages.filter((_, i) => i !== imageIndex),
        };
      }
      return plan;
    }));
  };

  // Content management
  const updatePageContent = (planId: string, content: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        return { ...plan, pageContent: content };
      }
      return plan;
    }));
  };

  const handleSave = async (planId: string) => {
    setIsSaving(true);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Filter out empty items
      const currentLinks = Array.isArray(plan.accessLinks)
        ? (plan.accessLinks as AccessLink[])
        : [];
      const validLinks = currentLinks.filter((link) => link.title.trim() && link.url.trim());

      const currentVideos = Array.isArray(plan.pageVideos)
        ? (plan.pageVideos as VideoItem[])
        : [];
      const validVideos = currentVideos.filter((video) => video.title.trim() && video.url.trim());

      const currentImages = Array.isArray(plan.pageImages)
        ? (plan.pageImages as ImageItem[])
        : [];
      const validImages = currentImages.filter((image) => image.url.trim());

      const response = await fetch(`/api/mentor/subscriptions/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageContent: plan.pageContent?.trim() || null,
          accessLinks: validLinks.length > 0 ? validLinks : null,
          pageVideos: validVideos.length > 0 ? validVideos : null,
          pageImages: validImages.length > 0 ? validImages : null,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Subscription page updated successfully!");
    } catch (error) {
      console.error("Error saving subscription content:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "WEEKLY":
        return "week";
      case "MONTHLY":
        return "month";
      case "YEARLY":
        return "year";
      default:
        return "month";
    }
  };

  if (plans.length === 0) {
    return (
      <div>
        <Button href="/mentor-dashboard" variant="ghost" size="sm" className="mb-4">
          ← Back to Dashboard
        </Button>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="py-12 text-center">
            <div className="mb-4 text-6xl">📦</div>
            <h2 className="mb-2 text-xl font-semibold text-amber-200">No Subscription Plans Yet</h2>
            <p className="mb-6 text-white/60">
              Create subscription plans first from your profile editor to customize their pages
            </p>
            <Button href="/mentor-dashboard/profile" variant="primary">
              Go to Profile Editor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button href="/mentor-dashboard" variant="ghost" size="sm" className="mb-4">
          ← Back to Dashboard
        </Button>
        <h1 className="h1 mb-2">Edit Subscription Pages</h1>
        <p className="text-white/60">
          Customize what your subscribers see for each plan. Add custom content, videos, images, and resources.
        </p>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          const currentLinks = Array.isArray(plan.accessLinks)
            ? (plan.accessLinks as AccessLink[])
            : [];
          const currentVideos = Array.isArray(plan.pageVideos)
            ? (plan.pageVideos as VideoItem[])
            : [];
          const currentImages = Array.isArray(plan.pageImages)
            ? (plan.pageImages as ImageItem[])
            : [];

          return (
            <Card key={plan.id}>
              <CardContent>
                {/* Plan Header */}
                <div
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                >
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-white/60">
                      {formatCurrency(plan.price)}/{getIntervalLabel(plan.interval)}
                      {plan.description && (
                        <>
                          {" • "}
                          {plan.description}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      href={`/subscribe/${mentorId}/${plan.id}`}
                      variant="ghost"
                      size="sm"
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Preview
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-white/60" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/60" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
                    {/* Page Content */}
                    <div>
                      <h4 className="mb-2 font-medium text-white/90">Subscription Page Content</h4>
                      <p className="mb-3 text-sm text-white/60">
                        Describe your subscription, what subscribers get, expectations, etc. This content will be shown to potential subscribers on the subscription page.
                      </p>
                      <textarea
                        value={plan.pageContent || ""}
                        onChange={(e) => updatePageContent(plan.id, e.target.value)}
                        placeholder="Tell subscribers about your subscription plan, what they'll get, how it works, what to expect..."
                        rows={8}
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <p className="mt-1 text-xs text-white/40">{plan.pageContent?.length || 0} characters</p>
                    </div>

                    {/* Videos */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white/90">Videos</h4>
                          <p className="text-sm text-white/60">
                            Add YouTube, Vimeo, or Loom videos to showcase your subscription
                          </p>
                        </div>
                        <Button onClick={() => addVideo(plan.id)} size="sm" variant="ghost">
                          <Video className="mr-1 h-4 w-4" />
                          Add Video
                        </Button>
                      </div>

                      {currentVideos.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-6 text-center">
                          <p className="text-sm text-white/50">
                            No videos added yet. Add intro videos, testimonials, or explainer content.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentVideos.map((video, videoIndex) => (
                            <div
                              key={videoIndex}
                              className="rounded-lg border border-white/10 bg-white/5 p-3"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-white/70">
                                  Video #{videoIndex + 1}
                                </span>
                                <Button
                                  onClick={() => removeVideo(plan.id, videoIndex)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={video.title}
                                  onChange={(e) => updateVideo(plan.id, videoIndex, "title", e.target.value)}
                                  placeholder="Video title"
                                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <input
                                  type="url"
                                  value={video.url}
                                  onChange={(e) => updateVideo(plan.id, videoIndex, "url", e.target.value)}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <textarea
                                  value={video.description || ""}
                                  onChange={(e) => updateVideo(plan.id, videoIndex, "description", e.target.value)}
                                  placeholder="Video description (optional)"
                                  rows={2}
                                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white/90">Images</h4>
                          <p className="text-sm text-white/60">
                            Add images to showcase what subscribers will get
                          </p>
                        </div>
                        <Button onClick={() => addImage(plan.id)} size="sm" variant="ghost">
                          <ImageIcon className="mr-1 h-4 w-4" />
                          Add Image
                        </Button>
                      </div>

                      {currentImages.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-6 text-center">
                          <p className="text-sm text-white/50">
                            No images added yet. Click &quot;Add Image&quot; to upload.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentImages.map((image, imageIndex) => (
                            <div
                              key={imageIndex}
                              className="rounded-lg border border-white/10 bg-white/5 p-3"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-white/70">
                                  Image #{imageIndex + 1}
                                </span>
                                <Button
                                  onClick={() => removeImage(plan.id, imageIndex)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                {/* Image Uploader */}
                                <ImageUploader
                                  currentImageUrl={image.url}
                                  onUploadComplete={(url) => updateImage(plan.id, imageIndex, "url", url)}
                                  onRemove={() => updateImage(plan.id, imageIndex, "url", "")}
                                  label={image.url ? "Change Image" : "Upload Image"}
                                />

                                {/* Caption */}
                                <input
                                  type="text"
                                  value={image.caption || ""}
                                  onChange={(e) => updateImage(plan.id, imageIndex, "caption", e.target.value)}
                                  placeholder="Image caption (optional)"
                                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Access Links */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white/90">Resources & Links</h4>
                          <p className="text-sm text-white/60">
                            Exclusive content for subscribers (Discord, Telegram, etc.)
                          </p>
                        </div>
                        <Button onClick={() => addLink(plan.id)} size="sm" variant="ghost">
                          <Plus className="mr-1 h-4 w-4" />
                          Add Link
                        </Button>
                      </div>

                      {currentLinks.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-6 text-center">
                          <p className="text-sm text-white/50">
                            No resources added yet. Click &quot;Add Link&quot; to add Discord, Telegram, or other exclusive content.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentLinks.map((link, linkIndex) => (
                            <div
                              key={linkIndex}
                              className="rounded-lg border border-white/10 bg-white/5 p-3"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-white/70">
                                  Link #{linkIndex + 1}
                                </span>
                                <Button
                                  onClick={() => removeLink(plan.id, linkIndex)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={link.title}
                                  onChange={(e) => updateLink(plan.id, linkIndex, "title", e.target.value)}
                                  placeholder="Link title (e.g., Discord Community)"
                                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => updateLink(plan.id, linkIndex, "url", e.target.value)}
                                  placeholder="https://discord.gg/..."
                                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(plan.id)}
                        disabled={isSaving}
                        variant="primary"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="mt-6 text-center text-sm text-white/50">
        💡 Tip: Upload high-quality images and add compelling videos to showcase the value of your subscription!
      </p>
    </div>
  );
}
