"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MarkdownRenderer } from "@/components/docs/markdown-renderer";
import type { BreadcrumbItem, DocPageMeta } from "@/types/docs";

interface DocPageProps {
  meta: DocPageMeta;
  content: string;
  breadcrumbs: BreadcrumbItem[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export function DocPage({
  meta,
  content,
  breadcrumbs,
  prev,
  next,
}: DocPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-w-0"
    >
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {meta.title}
        </h1>
        {meta.description && (
          <p className="mt-3 text-lg text-muted-foreground">{meta.description}</p>
        )}
        {meta.lastUpdated && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Last updated: {meta.lastUpdated}
          </p>
        )}
      </header>

      <MarkdownRenderer content={content} />

      {(prev || next) && (
        <nav className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
          {prev ? (
            <Link
              href={prev.href}
              className="group flex items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:max-w-[45%]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="font-medium">{prev.title}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              href={next.href}
              className="group flex items-center justify-end gap-2 rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/50 sm:max-w-[45%] sm:ml-auto"
            >
              <div>
                <p className="text-xs text-muted-foreground">Next</p>
                <p className="font-medium">{next.title}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </nav>
      )}
    </motion.div>
  );
}
