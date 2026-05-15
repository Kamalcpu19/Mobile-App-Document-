"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FolderOpen, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocsScrollOptional } from "@/components/providers/docs-scroll-provider";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types/docs";

export function SearchDialog() {
  const router = useRouter();
  const docsScroll = useDocsScrollOptional();
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

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");

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
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search docs...</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono sm:inline">
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
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-[15%] z-[70] w-full max-w-lg -translate-x-1/2 px-4"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                <div className="flex items-center gap-3 border-b border-border px-4">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search modules and pages..."
                    className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto custom-scrollbar">
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
                    <ul className="p-2">
                      {results.map((result, index) => (
                        <li key={`${result.href}-${index}`}>
                          <button
                            type="button"
                            onClick={() => navigate(result.href)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
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
                            <div className="min-w-0">
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
