import fs from "fs";
import path from "path";
import matter from "gray-matter";
import navigationData from "@/data/navigation.json";
import {
  getDocHref,
  getSectionId,
} from "@/lib/doc-navigation";
import type {
  DocsNavigation,
  Module,
  Submodule,
  DocPageMeta,
  DocSection,
  SearchResult,
  TocItem,
} from "@/types/docs";

const navigation = navigationData as DocsNavigation;
const CONTENT_DIR = path.join(process.cwd(), "src/content");

export function getNavigation(): DocsNavigation {
  return navigation;
}

export function getModules(): Module[] {
  return [...navigation.modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getModuleBySlug(slug: string): Module | undefined {
  return getModules().find((m) => m.slug === slug);
}

export function getSubmodule(
  moduleSlug: string,
  submoduleSlug: string
): Submodule | undefined {
  const mod = getModuleBySlug(moduleSlug);
  return mod?.submodules.find((s) => s.slug === submoduleSlug);
}

export function getAllDocPaths(): { moduleSlug: string; submoduleSlug: string }[] {
  const paths: { moduleSlug: string; submoduleSlug: string }[] = [];
  for (const mod of getModules()) {
    for (const sub of mod.submodules) {
      paths.push({ moduleSlug: mod.slug, submoduleSlug: sub.slug });
    }
  }
  return paths;
}

export {
  getDocHref,
  getSectionId,
  parseSectionId,
} from "@/lib/doc-navigation";

export function getAllDocSections(): DocSection[] {
  const sections: DocSection[] = [];

  for (const mod of getModules()) {
    const sortedSubs = [...mod.submodules].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    for (const sub of sortedSubs) {
      const doc = getDocContent(mod.slug, sub.slug);
      if (!doc) continue;

      sections.push({
        sectionId: getSectionId(mod.slug, sub.slug),
        moduleSlug: mod.slug,
        submoduleSlug: sub.slug,
        moduleTitle: mod.title,
        title: doc.meta.title,
        description: doc.meta.description,
        lastUpdated: doc.meta.lastUpdated,
        content: doc.content,
        href: getDocHref(mod.slug, sub.slug),
      });
    }
  }

  return sections;
}

export function getDocContent(
  moduleSlug: string,
  submoduleSlug: string
): { content: string; meta: DocPageMeta } | null {
  const filePath = path.join(
    CONTENT_DIR,
    moduleSlug,
    `${submoduleSlug}.md`
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const sub = getSubmodule(moduleSlug, submoduleSlug);

  return {
    content,
    meta: {
      title: (data.title as string) || sub?.title || submoduleSlug,
      description: (data.description as string) || sub?.description,
      moduleSlug,
      submoduleSlug,
      lastUpdated: data.lastUpdated as string | undefined,
    },
  };
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].replace(/`([^`]+)`/g, "$1").trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    items.push({ id, title, level });
  }

  return items;
}

export function searchDocs(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const mod of getModules()) {
    if (
      mod.title.toLowerCase().includes(q) ||
      mod.description?.toLowerCase().includes(q)
    ) {
      results.push({
        type: "module",
        moduleSlug: mod.slug,
        title: mod.title,
        description: mod.description,
        href: `/docs/${mod.slug}`,
      });
    }

    for (const sub of mod.submodules) {
      if (
        sub.title.toLowerCase().includes(q) ||
        sub.description?.toLowerCase().includes(q)
      ) {
        results.push({
          type: "submodule",
          moduleSlug: mod.slug,
          submoduleSlug: sub.slug,
          title: sub.title,
          description: sub.description,
          href: getDocHref(mod.slug, sub.slug),
        });
      }
    }
  }

  return results;
}

export function getAdjacentPages(
  moduleSlug: string,
  submoduleSlug: string
): { prev?: { title: string; href: string }; next?: { title: string; href: string } } {
  const paths = getAllDocPaths();
  const index = paths.findIndex(
    (p) => p.moduleSlug === moduleSlug && p.submoduleSlug === submoduleSlug
  );

  if (index === -1) return {};

  const prev = index > 0 ? paths[index - 1] : undefined;
  const next = index < paths.length - 1 ? paths[index + 1] : undefined;

  return {
    prev: prev
      ? {
          title: getSubmodule(prev.moduleSlug, prev.submoduleSlug)?.title ?? "",
          href: getDocHref(prev.moduleSlug, prev.submoduleSlug),
        }
      : undefined,
    next: next
      ? {
          title: getSubmodule(next.moduleSlug, next.submoduleSlug)?.title ?? "",
          href: getDocHref(next.moduleSlug, next.submoduleSlug),
        }
      : undefined,
  };
}
