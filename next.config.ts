import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "resources.cloudhi.io",
      },
    ],
  },
  experimental: {},
};

export default nextConfig;
