"use client";

import Link from "next/link";
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
  Route,
  User,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
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
  user: User,
};

interface SidebarProps {
  modules: Module[];
}

export function Sidebar({ modules }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const activeModuleSlug = useMemo(() => {
    const match = pathname.match(/^\/docs\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (activeModuleSlug) {
      setExpanded((prev) => new Set(prev).add(activeModuleSlug));
    }
  }, [activeModuleSlug]);

  const toggleModule = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Documentation navigation">
      {modules.map((mod) => {
        const Icon = iconMap[mod.icon ?? ""] ?? ClipboardList;
        const isExpanded = expanded.has(mod.slug);
        const isModuleActive = activeModuleSlug === mod.slug;

        return (
          <motion.div
            key={mod.id}
            initial={false}
            className="rounded-lg"
          >
            <button
              type="button"
              onClick={() => toggleModule(mod.slug)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
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
                      const href = `/docs/${mod.slug}/${sub.slug}`;
                      const isActive = pathname === href;

                      return (
                        <li key={sub.id}>
                          <Link
                            href={href}
                            onClick={close}
                            className={cn(
                              "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                              isActive
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                            )}
                          >
                            <ChevronRight
                              className={cn(
                                "h-3 w-3 shrink-0 transition-opacity",
                                isActive ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"
                              )}
                            />
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar">
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={close}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar pt-14 lg:hidden"
            >
              <div className="custom-scrollbar flex-1 overflow-y-auto">
                {sidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
