import type { TocItem } from "@/types/docs";

/** Metadata headings — not useful in the "On this page" navigation. */
const SKIP_TOC_TITLES = new Set(["document information"]);

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].replace(/`([^`]+)`/g, "$1").trim();
    if (SKIP_TOC_TITLES.has(title.toLowerCase())) continue;
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    items.push({ id, title, level });
  }

  return items;
}
