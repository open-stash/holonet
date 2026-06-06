import { preload } from "react-dom";
import { AuthLeftPanel } from "@/components/auth/auth-left-panel";
import { AUTH_LOGIN_BG, AUTH_LOGO } from "@/lib/auth-assets";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  preload(AUTH_LOGIN_BG, { as: "image", fetchPriority: "high" });
  preload(AUTH_LOGO, { as: "image", fetchPriority: "high" });

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <AuthLeftPanel />
      <div className="flex w-full flex-col lg:w-[45%]">{children}</div>
    </div>
  );
}
