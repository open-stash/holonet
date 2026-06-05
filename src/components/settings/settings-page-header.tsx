interface SettingsPageHeaderProps {
  title: string;
  description?: string;
}

export function SettingsPageHeader({
  title,
  description,
}: SettingsPageHeaderProps) {
  return (
    <header className="mb-6 max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </header>
  );
}
