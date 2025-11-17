"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";
import { Plus, Trash2, Eye, Save, Image as ImageIcon, Video } from "lucide-react";
import ImageUploader from "@/components/common/ImageUploader";

interface AccessLink {
  type: string;
  title: string;
  url: string;
  description?: string;
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

interface MentorData {
  id: string;
  name: string;
  accessPassWelcome?: string | null;
  accessPassPageContent?: string | null;
  accessPassLinks?: unknown;
  accessPassVideos?: unknown;
  accessPassImages?: unknown;
}

interface AccessPassEditorProps {
  mentor: MentorData;
}

export default function AccessPassEditor({ mentor }: AccessPassEditorProps) {
  const [welcomeMessage, setWelcomeMessage] = useState(mentor.accessPassWelcome || "");
  const [pageContent, setPageContent] = useState(mentor.accessPassPageContent || "");
  const [links, setLinks] = useState<AccessLink[]>(
    Array.isArray(mentor.accessPassLinks)
      ? (mentor.accessPassLinks as AccessLink[])
      : []
  );
  const [videos, setVideos] = useState<VideoItem[]>(
    Array.isArray(mentor.accessPassVideos)
      ? (mentor.accessPassVideos as VideoItem[])
      : []
  );
  const [images, setImages] = useState<ImageItem[]>(
    Array.isArray(mentor.accessPassImages)
      ? (mentor.accessPassImages as ImageItem[])
      : []
  );
  const [isSaving, setIsSaving] = useState(false);

  const addLink = () => {
    setLinks([
      ...links,
      { type: "link", title: "", url: "", description: "" },
    ]);
  };

  const updateLink = (index: number, field: keyof AccessLink, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Video management
  const addVideo = () => {
    setVideos([...videos, { title: "", url: "", description: "" }]);
  };

  const updateVideo = (index: number, field: keyof VideoItem, value: string) => {
    const updatedVideos = [...videos];
    updatedVideos[index] = { ...updatedVideos[index], [field]: value };
    setVideos(updatedVideos);
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // Image management
  const addImage = () => {
    setImages([...images, { url: "", caption: "" }]);
  };

  const updateImage = (index: number, field: keyof ImageItem, value: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setImages(updatedImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Filter out empty items
      const validLinks = links.filter((link) => link.title.trim() && link.url.trim());
      const validVideos = videos.filter((video) => video.title.trim() && video.url.trim());
      const validImages = images.filter((image) => image.url.trim());

      const response = await fetch("/api/mentor/access-pass", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessPassWelcome: welcomeMessage.trim() || null,
          accessPassPageContent: pageContent.trim() || null,
          accessPassLinks: validLinks.length > 0 ? validLinks : null,
          accessPassVideos: validVideos.length > 0 ? validVideos : null,
          accessPassImages: validImages.length > 0 ? validImages : null,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Access Pass page updated successfully!");
    } catch (error) {
      console.error("Error saving access pass content:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button href="/mentor-dashboard" variant="ghost" size="sm" className="mb-4">
          ← Back to Dashboard
        </Button>
        <h1 className="h1 mb-2">Edit Access Pass Page</h1>
        <p className="text-white/60">
          Customize the page that your Access Pass holders will see. Add welcome messages, exclusive links, resources, and content.
        </p>
      </div>

      {/* Preview Link */}
      <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-center justify-between">
          <div>
            <h3 className="mb-1 font-semibold text-blue-200">Preview Your Access Pass Page</h3>
            <p className="text-sm text-white/60">See how your page looks to Access Pass holders</p>
          </div>
          <Button href={`/access-pass/${mentor.id}`} variant="ghost" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="mb-6">
        <CardContent>
          <h2 className="mb-4 text-lg font-semibold">Welcome Message</h2>
          <p className="mb-4 text-sm text-white/60">
            Write a personalized welcome message for your Access Pass holders. This will be the first thing they see.
          </p>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Welcome to my exclusive Access Pass! Here you'll find..."
            rows={6}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <p className="mt-2 text-xs text-white/40">
            {welcomeMessage.length} characters
          </p>
        </CardContent>
      </Card>

      {/* Page Content */}
      <Card className="mb-6">
        <CardContent>
          <h2 className="mb-4 text-lg font-semibold">Access Pass Content</h2>
          <p className="mb-4 text-sm text-white/60">
            Describe what your Access Pass includes, what holders will get access to, and any important details.
          </p>
          <textarea
            value={pageContent}
            onChange={(e) => setPageContent(e.target.value)}
            placeholder="Tell Access Pass holders about what's included, how to access resources, what to expect..."
            rows={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <p className="mt-2 text-xs text-white/40">
            {pageContent.length} characters
          </p>
        </CardContent>
      </Card>

      {/* Videos */}
      <Card className="mb-6">
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Videos</h2>
              <p className="text-sm text-white/60">
                Add intro videos, tutorials, or exclusive video content
              </p>
            </div>
            <Button onClick={addVideo} size="sm" variant="ghost">
              <Video className="mr-1 h-4 w-4" />
              Add Video
            </Button>
          </div>

          {videos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-8 text-center">
              <p className="mb-2 text-white/60">No videos added yet</p>
              <p className="text-sm text-white/40">
                Click &quot;Add Video&quot; to add YouTube, Vimeo, or Loom videos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-white/70">
                      Video #{index + 1}
                    </span>
                    <Button
                      onClick={() => removeVideo(index)}
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
                      onChange={(e) => updateVideo(index, "title", e.target.value)}
                      placeholder="Video title"
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <input
                      type="url"
                      value={video.url}
                      onChange={(e) => updateVideo(index, "url", e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <textarea
                      value={video.description || ""}
                      onChange={(e) => updateVideo(index, "description", e.target.value)}
                      placeholder="Video description (optional)"
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="mb-6">
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Images</h2>
              <p className="text-sm text-white/60">
                Upload images to showcase what Access Pass holders will get
              </p>
            </div>
            <Button onClick={addImage} size="sm" variant="ghost">
              <ImageIcon className="mr-1 h-4 w-4" />
              Add Image
            </Button>
          </div>

          {images.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-8 text-center">
              <p className="mb-2 text-white/60">No images added yet</p>
              <p className="text-sm text-white/40">
                Click &quot;Add Image&quot; to upload images
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-white/70">
                      Image #{index + 1}
                    </span>
                    <Button
                      onClick={() => removeImage(index)}
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
                      onUploadComplete={(url) => updateImage(index, "url", url)}
                      onRemove={() => updateImage(index, "url", "")}
                      label={image.url ? "Change Image" : "Upload Image"}
                    />

                    {/* Caption */}
                    <input
                      type="text"
                      value={image.caption || ""}
                      onChange={(e) => updateImage(index, "caption", e.target.value)}
                      placeholder="Image caption (optional)"
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Links */}
      <Card className="mb-6">
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Resources & Links</h2>
              <p className="text-sm text-white/60">
                Add exclusive links, resources, and content for your Access Pass holders
              </p>
            </div>
            <Button onClick={addLink} size="sm" variant="primary">
              <Plus className="mr-1 h-4 w-4" />
              Add Link
            </Button>
          </div>

          {links.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-8 text-center">
              <p className="mb-2 text-white/60">No resources added yet</p>
              <p className="text-sm text-white/40">
                Click &quot;Add Link&quot; to add Discord servers, Telegram groups, Google Drives, or any other exclusive content
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-white/90">Resource #{index + 1}</h3>
                    <Button
                      onClick={() => removeLink(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {/* Type */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white/70">
                        Type
                      </label>
                      <select
                        value={link.type}
                        onChange={(e) => updateLink(index, "type", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="link">Website/Link</option>
                        <option value="discord">Discord Server</option>
                        <option value="telegram">Telegram Group</option>
                        <option value="drive">Google Drive</option>
                        <option value="notion">Notion Page</option>
                        <option value="video">Video Content</option>
                        <option value="document">Document</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white/70">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(index, "title", e.target.value)}
                        placeholder="e.g., Private Discord Community"
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white/70">
                        URL *
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, "url", e.target.value)}
                        placeholder="https://discord.gg/..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white/70">
                        Description (optional)
                      </label>
                      <textarea
                        value={link.description || ""}
                        onChange={(e) => updateLink(index, "description", e.target.value)}
                        placeholder="Brief description of what this resource provides..."
                        rows={2}
                        className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="primary"
          className="flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button href="/mentor-dashboard" variant="ghost">
          Cancel
        </Button>
      </div>

      {/* Help Text */}
      <p className="mt-6 text-center text-sm text-white/50">
        💡 Tip: Upload high-quality images and add compelling videos to showcase the value of your Access Pass!
      </p>
    </div>
  );
}
