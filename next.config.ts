import type { NextConfig } from "next";

const useDefaultDistDir =
  process.env.NETLIFY === "true" || process.env.CI === "true";

/**
 * Locally, keep build output under node_modules/.cache so OneDrive does not lock
 * `.next/trace` (a common cause of EPERM / dev errors on Windows).
 * Netlify's @netlify/plugin-nextjs requires the default `.next` directory.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  ...(!useDefaultDistDir && { distDir: "node_modules/.cache/next" }),
};

export default nextConfig;
