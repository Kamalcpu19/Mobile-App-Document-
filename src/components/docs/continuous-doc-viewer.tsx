"use client";

import { useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/docs/markdown-renderer";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useDocsScroll } from "@/components/providers/docs-scroll-provider";
import { stripDuplicateHeading } from "@/lib/markdown-strip";
import { cn } from "@/lib/utils";

const SCROLL_THROTTLE_MS = 120;

export function ContinuousDocViewer() {
  const {
    sections,
    activeSectionId,
    scrollContainerRef,
    setActiveSectionId,
    isNavigationLocked,
    registerSectionElement,
    computeActiveSectionFromScroll,
  } = useDocsScroll();

  const rafRef = useRef<number | null>(null);
  const lastScrollUpdateRef = useRef(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || sections.length === 0) return;

    const handleScroll = () => {
      if (isNavigationLocked()) return;

      const now = Date.now();
      if (now - lastScrollUpdateRef.current < SCROLL_THROTTLE_MS) {
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            handleScroll();
          });
        }
        return;
      }
      lastScrollUpdateRef.current = now;

      const nextId = computeActiveSectionFromScroll();
      if (nextId) {
        setActiveSectionId(nextId, { updateUrl: true });
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    sections,
    scrollContainerRef,
    setActiveSectionId,
    isNavigationLocked,
    computeActiveSectionFromScroll,
  ]);

  return (
    <div className="space-y-0">
      {sections.map((section, index) => {
        const isActive = activeSectionId === section.sectionId;

        return (
          <section
            key={section.sectionId}
            id={section.sectionId}
            data-section-id={section.sectionId}
            ref={(el) => registerSectionElement(section.sectionId, el)}
            className={cn(
              "scroll-mt-8 border-b border-border py-12 last:border-b-0",
              "content-visibility-auto",
              index === 0 && "pt-4"
            )}
          >
            <motion.div
              initial={false}
              animate={{ opacity: isActive ? 1 : 0.92 }}
              transition={{ duration: 0.2 }}
            >
              <Breadcrumbs
                items={[
                  { label: section.moduleTitle, href: section.href },
                  { label: section.title },
                ]}
                className="mb-6"
              />

              <header className="mb-8 border-b border-border pb-6">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="mt-3 text-lg text-muted-foreground">
                    {section.description}
                  </p>
                )}
                {section.lastUpdated && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Last updated: {section.lastUpdated}
                  </p>
                )}
              </header>

              <MarkdownRenderer
                content={stripDuplicateHeading(
                  section.content,
                  section.title
                )}
              />
            </motion.div>
          </section>
        );
      })}
    </div>
  );
}
