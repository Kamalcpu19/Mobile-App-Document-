import type { NextConfig } from "next";

/**
 * Keep build output under node_modules/.cache so OneDrive does not lock `.next/trace`
 * (a common cause of recurring "Internal Server Error" in local dev on Windows).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  distDir: "node_modules/.cache/next",
};

export default nextConfig;
