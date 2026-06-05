"use client";

import {
  ProfileDetailsCard,
  ProfileDetailsHeading,
} from "@/components/settings/profile-details-card";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";

export function AccountSettingsPanel() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader
        title="Account"
        description="Your profile and account information."
      />

      <div className="flex max-w-2xl flex-col gap-3">
        <ProfileDetailsHeading />
        <ProfileDetailsCard />
      </div>
    </div>
  );
}
