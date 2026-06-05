"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import {
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-section";
import { useSettingsStore } from "@source/stores";

export function DangerZonePanel() {
  const hydrated = useSettingsStore((state) => state.hydrated);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  function handleReset() {
    resetSettings();
    toast.success("Settings reset", {
      description: "All preferences were restored to defaults.",
    });
  }

  function handleDeleteAccount() {
    if (
      !window.confirm(
        "Delete your account permanently? This cannot be undone."
      )
    ) {
      return;
    }
    toast.message("Account deletion requested", {
      description: "This will be available when account management is connected.",
    });
  }

  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader
        title="Danger zone"
        description="Irreversible actions for your account and data."
      />

      <div className="flex max-w-2xl flex-col gap-4">
        <SettingsSection
          title="Preferences"
          description="Reset app settings without deleting your stash."
        >
          <SettingsRow
            title="Reset settings"
            description="Restore all preferences to their defaults."
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200"
              onClick={handleReset}
              disabled={!hydrated}
            >
              Reset
            </Button>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection
          title="Account"
          description="Permanently remove your account and all associated data."
          className="border-rose-200/80"
        >
          <SettingsRow
            title="Delete account"
            description="This action cannot be undone."
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={handleDeleteAccount}
            >
              Delete account
            </Button>
          </SettingsRow>
        </SettingsSection>
      </div>
    </div>
  );
}
