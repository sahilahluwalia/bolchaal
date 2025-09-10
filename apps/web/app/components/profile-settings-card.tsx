"use client";

import { useEffect, useState } from "react";
import { InputField } from "@repo/ui/input-field";
import { Button } from "@repo/ui/button";
import { useUserProfile } from "../../utils/hooks";
import { trpc } from "../_trpc/client";
import { toast } from "sonner";

export function ProfileSettingsCard() {
  const { data: userProfile, isLoading, error, refetch } = useUserProfile();
  const updateProfileMutation = trpc.updateProfile.useMutation();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfile({ name: userProfile.name || "", email: userProfile.email || "" });
    }
  }, [userProfile]);

  const handleProfileChange = (key: "name" | "email", value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const capitalizeRole = (role: string) => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const handleSave = async () => {
    if (!userProfile) {
      toast.error("Unable to save settings. Please wait for your profile to load.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync({ name: profile.name, email: profile.email });
      await refetch();
      toast.success("Settings saved successfully! 🎉");
    } catch (error) {
      console.error("Failed to save settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading profile data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Please try refreshing the page or contact support if the problem persists.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        <Button onClick={handleSave} disabled={isLoading || isSaving} size="md" variant="primary" className="ui:flex ui:items-center ui:gap-2">
          {isSaving && (
            <svg className="ui:animate-spin -ui:ml-1 ui:mr-2 ui:h-4 ui:w-4 ui:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="ui:opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="ui:opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSaving ? "Saving..." : isLoading ? "Loading..." : "Save Settings"}
        </Button>
      </div>
      <div className="space-y-4">
        <InputField
          id="full-name"
          name="name"
          label="Full Name"
          type="text"
          value={isLoading ? "Loading..." : profile.name}
          onChange={(e) => handleProfileChange("name", e.target.value)}
          disabled={isLoading}
        />
        <InputField
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={isLoading ? "Loading..." : profile.email}
          onChange={(e) => handleProfileChange("email", e.target.value)}
          disabled={isLoading}
        />
        <InputField
          id="account-role"
          name="role"
          label="Account Role"
          type="text"
          value={isLoading ? "Loading..." : (userProfile?.role ? capitalizeRole(userProfile.role) : "Unknown")}
          onChange={() => {}}
          disabled={true}
          inputClassName="bg-gray-50 text-gray-700 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 -mt-3">Your account role cannot be changed</p>
      </div>
    </div>
  );
}


