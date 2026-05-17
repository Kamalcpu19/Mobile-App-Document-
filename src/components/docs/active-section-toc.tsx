"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { useDocsScroll } from "@/components/providers/docs-scroll-provider";
import { extractToc } from "@/lib/toc";
import { cn } from "@/lib/utils";

function useActiveSectionToc() {
  const { sections, activeSectionId } = useDocsScroll();

  const activeSection = useMemo(
    () => sections.find((s) => s.sectionId === activeSectionId) ?? sections[0],
    [sections, activeSectionId]
  );

  const tocItems = useMemo(
    () => (activeSection ? extractToc(activeSection.content) : []),
    [activeSection]
  );

  return { tocItems, activeSectionId };
}

export function MobileSectionToc() {
  const { tocItems, activeSectionId } = useActiveSectionToc();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [activeSectionId]);

  if (tocItems.length === 0) return null;

  return (
    <div className="mb-6 xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="touch-manipulation flex w-full min-h-[44px] items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <List className="h-4 w-4 text-primary" />
          On this page
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg border border-border bg-card/50 p-3">
              <TableOfContents items={tocItems} variant="inline" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DesktopSectionToc() {
  const { tocItems } = useActiveSectionToc();

  if (tocItems.length === 0) return null;

  return (
    <aside className="hidden w-52 shrink-0 xl:block 2xl:w-56">
      <div className="sticky top-[calc(3.75rem+1.5rem)] max-h-[calc(100dvh-5.5rem)] overflow-y-auto custom-scrollbar pr-2">
        <TableOfContents items={tocItems} variant="sidebar" />
      </div>
    </aside>
  );
}
