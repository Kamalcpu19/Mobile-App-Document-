/**
 * Remove the first markdown heading when it duplicates the page title
 * (content already shows title in the page header).
 */
function normalizeForCompare(s: string): string {
  return s
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^feature:\s*/i, "")
    .trim()
    .toLowerCase();
}

export function stripDuplicateHeading(markdown: string, pageTitle: string): string {
  const titleNorm = normalizeForCompare(pageTitle);
  if (!titleNorm || !markdown) return markdown;

  let md = markdown.replace(/^\uFEFF/, "").trimStart();
  let guard = 0;

  while (guard++ < 8) {
    const firstLineMatch = md.match(/^(#{1,6})\s+(.+?)(\r?\n|$)/);
    if (!firstLineMatch) break;

    const headingText = normalizeForCompare(firstLineMatch[2]);
    if (headingText !== titleNorm) break;

    md = md.slice(firstLineMatch[0].length).trimStart();
  }

  return md;
}
