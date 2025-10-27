"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ProfileData {
  // Basic Info
  name?: string;
  tagline?: string;
  bio?: string;
  profileImage?: string;
  skills?: string;
  offerType?: string;
  accessPrice?: number;
  hourlyRate?: number;

  // Access Pass Content
  accessPassWelcome?: string;
  accessPassLinks?: { type: string; title: string; url: string; description?: string }[];

  // Video Intro
  videoIntro?: string;
}

interface ProfileEditorContextType {
  profileData: ProfileData;
  updateProfileData: (updates: Partial<ProfileData>) => void;
  resetProfileData: (initialData: ProfileData) => void;
}

const ProfileEditorContext = createContext<ProfileEditorContextType | undefined>(
  undefined
);

export function ProfileEditorProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData>({});

  const updateProfileData = useCallback((updates: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetProfileData = useCallback((initialData: ProfileData) => {
    setProfileData(initialData);
  }, []);

  return (
    <ProfileEditorContext.Provider
      value={{ profileData, updateProfileData, resetProfileData }}
    >
      {children}
    </ProfileEditorContext.Provider>
  );
}

export function useProfileEditor() {
  const context = useContext(ProfileEditorContext);
  if (!context) {
    throw new Error("useProfileEditor must be used within ProfileEditorProvider");
  }
  return context;
}
