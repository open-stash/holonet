import { SettingsHydrate } from "@/components/settings/settings-hydrate";

export default function SettingsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SettingsHydrate />
      {children}
    </>
  );
}
