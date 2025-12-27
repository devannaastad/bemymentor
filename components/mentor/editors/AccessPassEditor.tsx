"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import { Plus, Trash2, Link as LinkIcon, MessageSquare, FileText } from "lucide-react";
import { useProfileEditor } from "../ProfileEditorContext";

interface AccessLink {
  id?: string;
  type: "discord" | "telegram" | "slack" | "link" | "document";
  title: string;
  url: string;
  description?: string;
}

import { Mentor } from "@prisma/client";

interface AccessPassEditorProps {
  mentor: Mentor;
}

const LINK_TYPES = [
  { value: "discord", label: "Discord Server", icon: MessageSquare },
  { value: "telegram", label: "Telegram Group", icon: MessageSquare },
  { value: "slack", label: "Slack Workspace", icon: MessageSquare },
  { value: "link", label: "Custom Link", icon: LinkIcon },
  { value: "document", label: "Document/Resource", icon: FileText },
];

export default function AccessPassEditor({ mentor }: AccessPassEditorProps) {
  const { updateProfileData } = useProfileEditor();
  const [welcomeMessage, setWelcomeMessage] = useState(
    mentor.accessPassWelcome || ""
  );
  const [links, setLinks] = useState<AccessLink[]>(
    Array.isArray(mentor.accessPassLinks) ? (mentor.accessPassLinks as unknown as AccessLink[]) : []
  );

  // Sync changes to context
  useEffect(() => {
    updateProfileData({
      accessPassWelcome: welcomeMessage,
      accessPassLinks: links,
    });
  }, [welcomeMessage, links, updateProfileData]);

  const addLink = () => {
    const newLink: AccessLink = {
      type: "link",
      title: "",
      url: "",
      description: "",
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (index: number, field: keyof AccessLink, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const getLinkIcon = (type: string) => {
    const linkType = LINK_TYPES.find((t) => t.value === type);
    return linkType?.icon || LinkIcon;
  };

  // Only show this tab if mentor offers ACCESS or BOTH
  if (mentor.offerType === "TIME") {
    return (
      <Card>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-white/60">
              Access Pass Content is only available for ACCESS or BOTH offer types.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Change your offer type in the Basic Info tab to enable this feature.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">Welcome Message</h3>
          <p className="mb-4 text-sm text-white/60">
            This message will be shown to students when they first access your exclusive
            content after purchasing an access pass.
          </p>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Welcome to my exclusive community! I'm excited to have you here. Below you'll find all the resources and community links..."
            rows={6}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </CardContent>
      </Card>

      {/* Exclusive Links & Resources */}
      <Card>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Exclusive Links & Resources</h3>
              <p className="mt-1 text-sm text-white/60">
                Add Discord servers, Telegram groups, private resources, and more
              </p>
            </div>
            <Button onClick={addLink} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>

          {links.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-white/10 p-12 text-center">
              <LinkIcon className="mx-auto h-12 w-12 text-white/40" />
              <p className="mt-4 text-white/60">No links added yet</p>
              <p className="mt-2 text-sm text-white/40">
                Click &quot;Add Link&quot; to add exclusive resources for your pass holders
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link, index) => {
                const Icon = getLinkIcon(link.type);
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-purple-400" />
                        <span className="text-sm font-medium text-white/80">
                          Link {index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => removeLink(index)}
                        className="rounded-md p-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Type */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">
                          Type
                        </label>
                        <Select
                          value={link.type}
                          onChange={(e) => updateLink(index, "type", e.target.value)}
                        >
                          {LINK_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">
                          Title
                        </label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(index, "title", e.target.value)}
                          placeholder="e.g., Join our Discord Community"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>

                      {/* URL */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">
                          URL
                        </label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(index, "url", e.target.value)}
                          placeholder="https://discord.gg/..."
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">
                          Description (optional)
                        </label>
                        <input
                          type="text"
                          value={link.description || ""}
                          onChange={(e) =>
                            updateLink(index, "description", e.target.value)
                          }
                          placeholder="A brief description of what this link provides"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardContent>
          <h3 className="mb-2 text-lg font-semibold text-purple-300">
            💡 What students will see
          </h3>
          <p className="text-sm text-white/70">
            After purchasing an access pass, students will be redirected to a dedicated page
            showing your welcome message and all the links you&apos;ve added here. They can
            access this page anytime from their dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
