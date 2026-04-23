import type { NextConfig } from "next";

// Captured at build start — baked into the client bundle and served by /api/version,
// so the client can detect when it is running stale code and auto-reload.
const BUILD_ID =
  process.env.BUILD_ID ??
  process.env.NETLIFY_BUILD_ID ??
  process.env.COMMIT_REF ??
  String(Date.now());

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
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },
  experimental: {},
};

export default nextConfig;
