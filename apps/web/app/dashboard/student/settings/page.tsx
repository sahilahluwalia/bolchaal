import { ProfileSettingsCard } from "../../../components/profile-settings-card";

export default function StudentSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <ProfileSettingsCard />
      </div>
    </div>
  );
}
