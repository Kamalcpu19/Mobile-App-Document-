import Link from "next/link";
import { Logo } from "@/components/branding/logo";
import { branding } from "@/config/branding";
import { cn } from "@/lib/utils";

interface BrandHeaderProps {
  variant?: "navbar" | "sidebar";
  className?: string;
  onClick?: () => void;
}

export function BrandHeader({
  variant = "navbar",
  className,
  onClick,
}: BrandHeaderProps) {
  const isSidebar = variant === "sidebar";

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "group flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90",
        isSidebar && "rounded-lg p-2 hover:bg-sidebar-accent/50",
        className
      )}
    >
      <Logo size={isSidebar ? "md" : "md"} priority className="shrink-0" />

      <div className="min-w-0 flex flex-col leading-tight">
        <span
          className={cn(
            "truncate font-semibold text-foreground",
            isSidebar ? "text-sm" : "text-sm sm:text-base"
          )}
        >
          {branding.title}
        </span>
        <span
          className={cn(
            "mt-0.5 truncate text-muted-foreground",
            isSidebar ? "text-[11px]" : "text-xs"
          )}
        >
          <span className="inline-flex items-center rounded-md bg-muted/80 px-1.5 py-0.5 font-medium text-muted-foreground ring-1 ring-border/50 dark:bg-muted/40">
            {branding.versionLabel}
          </span>
        </span>
      </div>
    </Link>
  );
}
