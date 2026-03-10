import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.rightmove.co.uk" },
      { protocol: "https", hostname: "*.openrent.com" },
      { protocol: "https", hostname: "*.rightmove.co.uk" },
    ],
  },
};

export default nextConfig;
