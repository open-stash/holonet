import { AUTH_LOGO } from "@/lib/auth-assets";

interface AuthBrandHeaderProps {
  subtitle: string;
}

export function AuthBrandHeader({ subtitle }: AuthBrandHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <img
          src={AUTH_LOGO}
          alt="Open Stash logo"
          width={40}
          height={40}
          decoding="async"
          className="size-10 shrink-0 rounded-lg"
        />
        <span className="text-[1.35rem] font-bold leading-5 tracking-tight text-foreground">
          Open Stash
        </span>
      </div>
      <p className="text-[14px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}
