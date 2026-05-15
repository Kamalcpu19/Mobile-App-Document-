"use client";

import { useEffect, useRef } from "react";
import { useDocsScroll } from "@/components/providers/docs-scroll-provider";
import { getSectionId } from "@/lib/doc-navigation";

interface DocRouteSyncProps {
  moduleSlug: string;
  submoduleSlug: string;
}

/**
 * Scrolls to the URL target on direct links / browser navigation only.
 * Skips when manual sidebar navigation is in progress.
 */
export function DocRouteSync({ moduleSlug, submoduleSlug }: DocRouteSyncProps) {
  const {
    scrollToSection,
    scrollContainerRef,
    setActiveSectionId,
    sections,
    isNavigationLocked,
    getLockedSectionId,
    computeActiveSectionFromScroll,
  } = useDocsScroll();

  const lastSyncedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const sectionId = getSectionId(moduleSlug, submoduleSlug);
    const path = `/docs/${moduleSlug}/${submoduleSlug}`;

    if (!sections.some((s) => s.sectionId === sectionId)) return;

    const lockedId = getLockedSectionId();
    if (isNavigationLocked() && lockedId === sectionId) {
      return;
    }

    if (lastSyncedPathRef.current === path) {
      return;
    }

    const container = scrollContainerRef.current;
    const el =
      document.getElementById(sectionId) ?? null;

    if (container && el) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const isInView =
        elRect.top >= containerRect.top - 100 &&
        elRect.top <= containerRect.top + containerRect.height * 0.45;

      const currentFromScroll = computeActiveSectionFromScroll();

      if (isInView && currentFromScroll === sectionId) {
        setActiveSectionId(sectionId, { updateUrl: false });
        lastSyncedPathRef.current = path;
        return;
      }
    }

    lastSyncedPathRef.current = path;

    const frame = requestAnimationFrame(() => {
      scrollToSection(moduleSlug, submoduleSlug, "auto");
    });

    return () => cancelAnimationFrame(frame);
  }, [
    moduleSlug,
    submoduleSlug,
    scrollToSection,
    scrollContainerRef,
    setActiveSectionId,
    sections,
    isNavigationLocked,
    getLockedSectionId,
    computeActiveSectionFromScroll,
  ]);

  return null;
}
