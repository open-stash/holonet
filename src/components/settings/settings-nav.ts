import type { LucideIcon } from "lucide-react";
import {
  CircleHelp,
  CreditCard,
  KeyRound,
  MonitorSmartphone,
  Plug,
  User,
  Zap,
} from "lucide-react";

export interface SettingsNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const settingsNavItems: SettingsNavItem[] = [
  { href: "/settings/account", label: "Account", icon: User },
  { href: "/settings/sessions", label: "Devices", icon: MonitorSmartphone },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  {
    href: "/settings/connections",
    label: "Connections & MCP",
    icon: Zap,
  },
  { href: "/settings/api-keys", label: "Memory API keys", icon: KeyRound },
  { href: "/settings/support", label: "Support & Help", icon: CircleHelp },
];

export const dangerZoneHref = "/settings/danger-zone";
