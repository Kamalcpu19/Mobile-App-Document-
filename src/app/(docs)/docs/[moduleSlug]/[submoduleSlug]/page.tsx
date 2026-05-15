import { notFound } from "next/navigation";
import { DocRouteSync } from "@/components/docs/doc-route-sync";
import {
  getAllDocPaths,
  getDocContent,
  getModuleBySlug,
  getSubmodule,
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

  return (
    <DocRouteSync moduleSlug={moduleSlug} submoduleSlug={submoduleSlug} />
  );
}
