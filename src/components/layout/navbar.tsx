"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandHeader } from "@/components/branding/brand-header";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SearchDialog } from "@/components/search/search-dialog";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toggle, isOpen, close } = useSidebar();
  const [mounted, setMounted] = useState(false);

  const isDocsRoute = pathname.startsWith("/docs");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isDocsRoute && isOpen) close();
  }, [isDocsRoute, isOpen, close]);

  const isDark = mounted && (resolvedTheme ?? theme) === "dark";

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-border/80 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-14 min-h-[3.5rem] items-center gap-2 px-3 sm:h-[3.75rem] sm:gap-3 sm:px-4 md:px-5 lg:px-6">
        {isDocsRoute && (
          <button
            type="button"
            onClick={toggle}
            className="touch-manipulation inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent active:scale-[0.98] lg:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-docs-sidebar"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <BrandHeader
          variant="navbar"
          className={cn("min-w-0 flex-1", !isDocsRoute && "sm:flex-initial")}
          onClick={close}
        />

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SearchDialog />

          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="touch-manipulation inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent active:scale-[0.98]"
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
