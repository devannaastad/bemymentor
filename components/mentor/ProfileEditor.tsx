"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { User, Briefcase, Video, Lock, Save, Calendar } from "lucide-react";
import BasicInfoEditor from "./editors/BasicInfoEditor";
import PortfolioEditor from "./editors/PortfolioEditor";
import VideoEditor from "./editors/VideoEditor";
import AccessPassEditor from "./editors/AccessPassEditor";
import SubscriptionEditor from "./editors/SubscriptionEditor";
import { ProfileEditorProvider, useProfileEditor } from "./ProfileEditorContext";
import { useRouter } from "next/navigation";

type Tab = "basic" | "portfolio" | "video" | "access" | "subscriptions";

import { Mentor } from "@prisma/client";

interface ProfileEditorProps {
  mentor: Mentor;
}

function ProfileEditorContent({ mentor }: ProfileEditorProps) {
  const router = useRouter();
  const { profileData, resetProfileData } = useProfileEditor();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize profile data from mentor on mount
  useEffect(() => {
    resetProfileData({
      name: mentor.name,
      tagline: mentor.tagline,
      bio: mentor.bio || undefined,
      profileImage: mentor.profileImage || undefined,
      skills: (mentor.skills || []).join(", "),
      category: mentor.category,
      categories: mentor.categories || [],
      offerType: mentor.offerType,
      accessPrice: mentor.accessPrice ? mentor.accessPrice / 100 : 0,
      hourlyRate: mentor.hourlyRate ? mentor.hourlyRate / 100 : 0,
      socialLinks: (mentor.socialLinks as unknown as Record<string, string>) || {},
      portfolio: (mentor.portfolio as unknown as { title: string; description: string; imageUrl?: string; link?: string; type: string }[]) || [],
      accessPassWelcome: mentor.accessPassWelcome || "",
      accessPassLinks: (mentor.accessPassLinks as unknown as { type: string; title: string; url: string; description?: string }[]) || [],
      videoIntro: mentor.videoIntro || "",
    });
  }, [mentor, resetProfileData]);

  const tabs = [
    { id: "basic" as Tab, label: "Basic Info", icon: User },
    { id: "portfolio" as Tab, label: "Portfolio", icon: Briefcase },
    { id: "video" as Tab, label: "Video Intro", icon: Video },
    { id: "access" as Tab, label: "Access Pass Content", icon: Lock },
    { id: "subscriptions" as Tab, label: "Subscriptions", icon: Calendar },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/mentor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Failed to save profile");
      }

      alert("Profile updated successfully!");
      router.refresh(); // Refresh the page data
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(error instanceof Error ? error.message : "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap
                    ${isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "basic" && <BasicInfoEditor mentor={mentor} />}
        {activeTab === "portfolio" && <PortfolioEditor />}
        {activeTab === "video" && <VideoEditor mentor={mentor} />}
        {activeTab === "access" && <AccessPassEditor mentor={mentor} />}
        {activeTab === "subscriptions" && <SubscriptionEditor />}
      </div>

      {/* Save Button */}
      <div className="sticky bottom-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="shadow-2xl"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default function ProfileEditor({ mentor }: ProfileEditorProps) {
  return (
    <ProfileEditorProvider>
      <ProfileEditorContent mentor={mentor} />
    </ProfileEditorProvider>
  );
}
