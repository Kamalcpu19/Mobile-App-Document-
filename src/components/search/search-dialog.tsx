"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FolderOpen, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocsScrollOptional } from "@/components/providers/docs-scroll-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types/docs";

export function SearchDialog() {
  const router = useRouter();
  const docsScroll = useDocsScrollOptional();
  const { close: closeSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(query), 200);
    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    closeSidebar();

    const match = href.match(/^\/docs\/([^/]+)\/([^/]+)$/);
    if (docsScroll && match) {
      const [, moduleSlug, submoduleSlug] = match;
      if (window.location.pathname.startsWith("/docs/")) {
        docsScroll.scrollToSection(moduleSlug, submoduleSlug, "smooth");
        return;
      }
    }

    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].href);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-manipulation inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:min-w-0 sm:px-3"
        aria-label="Search documentation"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Search docs...</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono md:inline">
          Ctrl+K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed z-[70] w-full",
                "inset-x-0 bottom-0 sm:inset-x-auto sm:left-1/2 sm:top-[12%] sm:max-w-lg sm:-translate-x-1/2 sm:px-4"
              )}
              role="dialog"
              aria-modal="true"
              aria-label="Search documentation"
            >
              <div className="overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-xl">
                <div className="flex items-center gap-3 border-b border-border px-4">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    type="search"
                    enterKeyHint="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search modules and pages..."
                    className="min-h-[48px] flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                  />
                </div>

                <div className="max-h-[min(50vh,20rem)] overflow-y-auto custom-scrollbar sm:max-h-72">
                  {loading && (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Searching...
                    </p>
                  )}
                  {!loading && query && results.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No results found
                    </p>
                  )}
                  {!loading && results.length > 0 && (
                    <ul className="p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                      {results.map((result, index) => (
                        <li key={`${result.href}-${index}`}>
                          <button
                            type="button"
                            onClick={() => navigate(result.href)}
                            className={cn(
                              "touch-manipulation flex w-full min-h-[44px] items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors sm:py-2.5",
                              index === selectedIndex
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            {result.type === "module" ? (
                              <FolderOpen className="mt-0.5 h-4 w-4 shrink-0" />
                            ) : (
                              <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{result.title}</p>
                              {result.description && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {result.description}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
