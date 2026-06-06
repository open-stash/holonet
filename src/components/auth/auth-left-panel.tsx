import { AUTH_LOGIN_BG } from "@/lib/auth-assets";

export function AuthLeftPanel() {
  return (
    <section
      className="relative hidden min-h-screen overflow-hidden bg-[#1c1c22] bg-cover bg-center lg:flex lg:w-[55%]"
      style={{ backgroundImage: `url('${AUTH_LOGIN_BG}')` }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/30 to-transparent" />
      <div className="absolute bottom-14 left-12 z-10 max-w-xs">
        <h2 className="mb-3 text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
          Your second brain.
        </h2>
        <p
          className="text-[15px] leading-relaxed text-white/90"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
        >
          Capture links, notes, files, and ideas in one place. Find them again
          exactly when you need them.
        </p>
      </div>
    </section>
  );
}
