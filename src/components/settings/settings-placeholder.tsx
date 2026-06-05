import { SettingsPageHeader } from "@/components/settings/settings-page-header";

interface SettingsPlaceholderProps {
  title: string;
  description: string;
}

export function SettingsPlaceholder({
  title,
  description,
}: SettingsPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader title={title} description={description} />
      <div className="max-w-2xl rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">Coming soon</p>
        <p className="mt-2 text-xs text-slate-500">
          This section is not available yet. Check back in a future update.
        </p>
      </div>
    </div>
  );
}
