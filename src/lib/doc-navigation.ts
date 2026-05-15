/** Client-safe navigation helpers (no Node.js fs). */

export function getDocHref(moduleSlug: string, submoduleSlug: string): string {
  return `/docs/${moduleSlug}/${submoduleSlug}`;
}

export function getSectionId(moduleSlug: string, submoduleSlug: string): string {
  return `${moduleSlug}--${submoduleSlug}`;
}

export function parseSectionId(sectionId: string): {
  moduleSlug: string;
  submoduleSlug: string;
} | null {
  const idx = sectionId.indexOf("--");
  if (idx === -1) return null;
  return {
    moduleSlug: sectionId.slice(0, idx),
    submoduleSlug: sectionId.slice(idx + 2),
  };
}
