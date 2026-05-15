import { notFound } from "next/navigation";
import { DocPage } from "@/components/docs/doc-page";
import {
  getAllDocPaths,
  getDocContent,
  getModuleBySlug,
  getSubmodule,
  extractToc,
  getAdjacentPages,
} from "@/lib/docs";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ moduleSlug: string; submoduleSlug: string }>;
}

export async function generateStaticParams() {
  return getAllDocPaths().map(({ moduleSlug, submoduleSlug }) => ({
    moduleSlug,
    submoduleSlug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleSlug, submoduleSlug } = await params;
  const doc = getDocContent(moduleSlug, submoduleSlug);
  if (!doc) return { title: "Not Found" };
  return {
    title: doc.meta.title,
    description: doc.meta.description,
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const { moduleSlug, submoduleSlug } = await params;

  const mod = getModuleBySlug(moduleSlug);
  const sub = getSubmodule(moduleSlug, submoduleSlug);
  const doc = getDocContent(moduleSlug, submoduleSlug);

  if (!mod || !sub || !doc) {
    notFound();
  }

  const toc = extractToc(doc.content);
  const { prev, next } = getAdjacentPages(moduleSlug, submoduleSlug);

  const breadcrumbs = [
    { label: mod.title, href: `/docs/${mod.slug}/${mod.submodules[0]?.slug}` },
    { label: sub.title },
  ];

  return (
    <DocPage
      meta={doc.meta}
      content={doc.content}
      breadcrumbs={breadcrumbs}
      toc={toc}
      prev={prev}
      next={next}
    />
  );
}
