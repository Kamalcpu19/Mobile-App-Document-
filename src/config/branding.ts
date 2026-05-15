/**
 * Central branding configuration.
 * Replace the logo at: public/branding/logo.png
 */
export const branding = {
  title: "Mobile App Documentation",
  shortTitle: "Mobile App Docs",
  version: "1.0",
  versionLabel: "Version 1.0",
  logo: {
    src: "/branding/logo.png",
    alt: "Mobile App Logo",
  },
} as const;

export type BrandingConfig = typeof branding;
