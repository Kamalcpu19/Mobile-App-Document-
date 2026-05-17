"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
  variant?: "sidebar" | "inline";
}

export function TableOfContents({
  items,
  variant = "sidebar",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const scrollRoot =
      document.getElementById("docs-scroll-container") ?? undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: scrollRoot,
        rootMargin: "-5rem 0px -70% 0px",
        threshold: 0,
      }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    const container = document.getElementById("docs-scroll-container");
    if (el && container) {
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        80;
      container.scrollTo({ top, behavior: "smooth" });
    } else {
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav aria-label="On this page">
      {variant === "sidebar" && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
      )}
      <ul
        className={cn(
          "space-y-1",
          variant === "sidebar" && "border-l border-border"
        )}
      >
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleClick(item.id)}
              className={cn(
                "touch-manipulation block w-full border-l-2 py-1.5 text-left text-sm transition-colors -ml-px",
                item.level === 2 && "pl-3",
                item.level === 3 && "pl-5",
                item.level === 4 && "pl-7",
                activeId === item.id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
