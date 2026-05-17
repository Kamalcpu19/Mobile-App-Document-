"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Car,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  GitBranch,
  Route,
  User,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useDocsScroll } from "@/components/providers/docs-scroll-provider";
import { getSectionId } from "@/lib/doc-navigation";
import { cn } from "@/lib/utils";
import type { Module } from "@/types/docs";

const iconMap: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "log-in": LogIn,
  "layout-dashboard": LayoutDashboard,
  "clipboard-list": ClipboardList,
  "message-square": MessageSquare,
  calendar: Calendar,
  car: Car,
  "credit-card": CreditCard,
  route: Route,
  "git-branch": GitBranch,
  user: User,
};

const sidebarPanelClass =
  "flex h-full min-h-0 w-[min(100vw-2rem,18rem)] shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar sm:w-64 md:w-72 lg:w-72 xl:w-80";

interface SidebarProps {
  modules: Module[];
}

export function Sidebar({ modules }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { activeSectionId, scrollToSection } = useDocsScroll();
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  const activeFromUrl = useMemo(() => {
    const match = pathname.match(/^\/docs\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return getSectionId(match[1], match[2]);
  }, [pathname]);

  const currentSectionId = activeSectionId || activeFromUrl;

  const activeModuleSlug = useMemo(() => {
    if (currentSectionId) {
      const idx = currentSectionId.indexOf("--");
      if (idx !== -1) return currentSectionId.slice(0, idx);
    }
    const match = pathname.match(/^\/docs\/([^/]+)/);
    return match?.[1] ?? null;
  }, [currentSectionId, pathname]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (activeModuleSlug) {
      setExpanded((prev) => new Set(prev).add(activeModuleSlug));
    }
  }, [activeModuleSlug]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const scrollEl = isOpen ? mobileScrollRef.current : desktopScrollRef.current;
    if (!activeItemRef.current || !scrollEl) return;
    activeItemRef.current.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [currentSectionId, isOpen]);

  const toggleModule = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleNavClick = useCallback(
    (moduleSlug: string, submoduleSlug: string) => {
      scrollToSection(moduleSlug, submoduleSlug, "smooth");
      close();
    },
    [scrollToSection, close]
  );

  const sidebarContent = (
    <nav
      className="flex flex-col gap-1 p-3 pt-4 lg:pt-3"
      aria-label="Documentation navigation"
    >
      {modules.map((mod) => {
        const Icon = iconMap[mod.icon ?? ""] ?? ClipboardList;
        const isExpanded = expanded.has(mod.slug);
        const isModuleActive = activeModuleSlug === mod.slug;

        return (
          <div key={mod.id} className="rounded-lg">
            <button
              type="button"
              onClick={() => toggleModule(mod.slug)}
              className={cn(
                "touch-manipulation flex w-full min-h-[44px] items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200",
                isModuleActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" />
              <span className="flex-1 truncate">{mod.title}</span>
              <motion.span
                animate={{ rotate: isExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {mod.submodules.map((sub) => {
                      const sectionId = getSectionId(mod.slug, sub.slug);
                      const isActive = currentSectionId === sectionId;

                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            ref={isActive ? activeItemRef : undefined}
                            onClick={() => handleNavClick(mod.slug, sub.slug)}
                            className={cn(
                              "touch-manipulation group flex w-full min-h-[40px] items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-all duration-200",
                              isActive
                                ? "bg-primary/10 font-medium text-primary shadow-sm"
                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                            )}
                          >
                            <ChevronRight
                              className={cn(
                                "h-3 w-3 shrink-0 transition-opacity",
                                isActive
                                  ? "text-primary opacity-100"
                                  : "opacity-0 group-hover:opacity-50"
                              )}
                            />
                            <span className="truncate">{sub.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside
        className={cn(sidebarPanelClass, "hidden lg:flex")}
        aria-label="Documentation sidebar"
      >
        <div
          ref={desktopScrollRef}
          className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {sidebarContent}
        </div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
              onClick={close}
              aria-hidden
            />
            <motion.aside
              id="mobile-docs-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Documentation navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={cn(
                sidebarPanelClass,
                "fixed inset-y-0 left-0 z-50 pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[calc(3.75rem+env(safe-area-inset-top))] lg:hidden"
              )}
            >
              <div
                ref={mobileScrollRef}
                className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
              >
                {sidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
