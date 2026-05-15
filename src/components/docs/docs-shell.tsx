"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ContinuousDocViewer } from "@/components/docs/continuous-doc-viewer";
import {
  DocsScrollProvider,
  useDocsScroll,
} from "@/components/providers/docs-scroll-provider";
import type { DocSection, Module } from "@/types/docs";

interface DocsShellProps {
  modules: Module[];
  sections: DocSection[];
  children: React.ReactNode;
}

function DocsMain({ children }: { children: React.ReactNode }) {
  const { scrollContainerRef } = useDocsScroll();

  return (
    <main
      ref={scrollContainerRef as React.RefObject<HTMLElement>}
      id="docs-scroll-container"
      className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth bg-background"
    >
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <ContinuousDocViewer />
        {children}
      </div>
    </main>
  );
}

function DocsShellInner({
  modules,
  children,
}: {
  modules: Module[];
  children: React.ReactNode;
}) {
  return (
    <div className="docs-shell flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar modules={modules} />
        <DocsMain>{children}</DocsMain>
      </div>
    </div>
  );
}

export function DocsShell({ modules, sections, children }: DocsShellProps) {
  return (
    <DocsScrollProvider sections={sections}>
      <DocsShellInner modules={modules}>{children}</DocsShellInner>
    </DocsScrollProvider>
  );
}
