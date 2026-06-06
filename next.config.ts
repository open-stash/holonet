import type { NextConfig } from "next";

const oneYearCache = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/custom-login-bg.png",
        headers: [{ key: "Cache-Control", value: oneYearCache }],
      },
      {
        source: "/logo.svg",
        headers: [{ key: "Cache-Control", value: oneYearCache }],
      },
    ];
  },
};

export default nextConfig;
