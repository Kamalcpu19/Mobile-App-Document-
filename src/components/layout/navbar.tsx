"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandHeader } from "@/components/branding/brand-header";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SearchDialog } from "@/components/search/search-dialog";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toggle, isOpen } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && (resolvedTheme ?? theme) === "dark";

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-[3.75rem] items-center gap-3 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <BrandHeader variant="navbar" className="min-w-0 flex-1 sm:flex-initial" />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SearchDialog />

          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent"
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
