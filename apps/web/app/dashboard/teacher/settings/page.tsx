"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "../../../../utils/hooks";
import { InputField } from "@repo/ui/input-field";

export default function TeacherSettingsPage() {
  const { data: userProfile, isLoading, error } = useUserProfile();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  // Initialize profile state with user data when it loads
  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name || "",
        email: userProfile.email || "",
      });
    }
  }, [userProfile]);


  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  // Helper function to capitalize role for display
  const capitalizeRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const handleSaveSettings = () => {
    if (!userProfile) {
      alert("Unable to save settings. Please wait for your profile to load.");
      return;
    }

    // In a real app, this would save to the API
    console.log("Saving settings:", { profile, userId: userProfile.id });
    alert("Settings saved successfully!");
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and application settings</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading profile data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please try refreshing the page or contact support if the problem persists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and application settings</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {/* Profile Settings */}
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
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Save Settings"}
              </button>
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
                onChange={() => {}} // Read-only field, no change handler needed
                disabled={true}
                inputClassName="bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 -mt-3">Your account role cannot be changed</p>
            </div>
          </div>



          {/* Account Security */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Not Implemented
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Update your password to keep your account secure</p>
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md cursor-not-allowed opacity-50"
                  disabled
                  onClick={() => alert("This feature is not implemented yet")}
                >
                  Update Password
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Not Implemented
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md cursor-not-allowed opacity-50"
                  disabled
                  onClick={() => alert("This feature is not implemented yet")}
                >
                  Enable 2FA
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Login Sessions</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Not Implemented
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Manage your active login sessions</p>
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md cursor-not-allowed opacity-50"
                  disabled
                  onClick={() => alert("This feature is not implemented yet")}
                >
                  View Active Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
