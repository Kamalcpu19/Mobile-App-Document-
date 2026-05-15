import Link from "next/link";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { getModules, getNavigation } from "@/lib/docs";
import { getDocHref } from "@/lib/doc-navigation";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  const nav = getNavigation();
  const modules = getModules();
  const firstModule = modules[0];
  const firstSubmodule = firstModule?.submodules[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            v{nav.version ?? "1.0"}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {nav.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {nav.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {firstSubmodule && firstModule && (
              <Link
                href={getDocHref(firstModule.slug, firstSubmodule.slug)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href={getDocHref("getting-started", "overview")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              <BookOpen className="h-4 w-4" />
              Browse Docs
            </Link>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => {
              const first = mod.submodules[0];
              const href = first
                ? getDocHref(mod.slug, first.slug)
                : `/docs/${mod.slug}`;

              return (
                <Link
                  key={mod.id}
                  href={href}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary">
                    {mod.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {mod.description}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {mod.submodules.length} pages
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-16 flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <Search className="h-4 w-4 shrink-0" />
            Press{" "}
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs">
              Ctrl+K
            </kbd>{" "}
            to search documentation
          </div>
        </div>
      </div>
    </div>
  );
}
