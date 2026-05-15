"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import type { DocSection } from "@/types/docs";
import { getSectionId } from "@/lib/doc-navigation";

const MANUAL_LOCK_SMOOTH_MS = 1600;
const MANUAL_LOCK_AUTO_MS = 500;
const URL_UPDATE_DEBOUNCE_MS = 200;

interface NavigationLock {
  sectionId: string;
  until: number;
}

interface DocsScrollContextValue {
  sections: DocSection[];
  activeSectionId: string | null;
  scrollContainerRef: RefObject<HTMLElement | null>;
  setActiveSectionId: (id: string, options?: { updateUrl?: boolean }) => void;
  scrollToSection: (
    moduleSlug: string,
    submoduleSlug: string,
    behavior?: ScrollBehavior
  ) => void;
  isNavigationLocked: () => boolean;
  getLockedSectionId: () => string | null;
  registerSectionElement: (sectionId: string, el: HTMLElement | null) => void;
  computeActiveSectionFromScroll: () => string | null;
}

const DocsScrollContext = createContext<DocsScrollContextValue | null>(null);

export function DocsScrollProvider({
  sections,
  children,
}: {
  sections: DocSection[];
  children: ReactNode;
}) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const sectionElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const navigationLockRef = useRef<NavigationLock | null>(null);
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUrlRef = useRef<string>("");

  const [activeSectionId, setActiveSectionIdState] = useState<string | null>(
    () => sections[0]?.sectionId ?? null
  );

  const isNavigationLocked = useCallback(() => {
    const lock = navigationLockRef.current;
    if (!lock) return false;
    if (Date.now() >= lock.until) {
      navigationLockRef.current = null;
      return false;
    }
    return true;
  }, []);

  const getLockedSectionId = useCallback(() => {
    const lock = navigationLockRef.current;
    if (!lock) return null;
    if (Date.now() >= lock.until) {
      navigationLockRef.current = null;
      return null;
    }
    return lock.sectionId;
  }, []);

  const lockNavigation = useCallback((sectionId: string, durationMs: number) => {
    navigationLockRef.current = {
      sectionId,
      until: Date.now() + durationMs,
    };
    setActiveSectionIdState(sectionId);
  }, []);

  const updateUrlForSection = useCallback(
    (sectionId: string) => {
      const section = sections.find((s) => s.sectionId === sectionId);
      if (!section) return;

      const href = section.href;
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);

      urlDebounceRef.current = setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname !== href) {
          lastUrlRef.current = href;
          router.replace(href, { scroll: false });
        }
      }, URL_UPDATE_DEBOUNCE_MS);
    },
    [router, sections]
  );

  const setActiveSectionId = useCallback(
    (sectionId: string, options?: { updateUrl?: boolean }) => {
      if (isNavigationLocked()) {
        const locked = getLockedSectionId();
        if (locked && locked !== sectionId) return;
      }

      setActiveSectionIdState((prev) => (prev === sectionId ? prev : sectionId));

      if (options?.updateUrl === false) return;
      if (isNavigationLocked()) return;

      updateUrlForSection(sectionId);
    },
    [isNavigationLocked, getLockedSectionId, updateUrlForSection]
  );

  const registerSectionElement = useCallback(
    (sectionId: string, el: HTMLElement | null) => {
      if (el) sectionElementsRef.current.set(sectionId, el);
      else sectionElementsRef.current.delete(sectionId);
    },
    []
  );

  const computeActiveSectionFromScroll = useCallback((): string | null => {
    const locked = getLockedSectionId();
    if (locked) return locked;

    const container = scrollContainerRef.current;
    if (!container || sections.length === 0) return null;

    const containerRect = container.getBoundingClientRect();
    const activationLine = containerRect.top + 120;

    let activeId: string | null = sections[0].sectionId;
    let bestTop = -Infinity;

    for (const section of sections) {
      const el = sectionElementsRef.current.get(section.sectionId);
      if (!el) continue;

      const top = el.getBoundingClientRect().top;

      if (top <= activationLine && top > bestTop) {
        bestTop = top;
        activeId = section.sectionId;
      }
    }

    return activeId;
  }, [sections, getLockedSectionId]);

  const scrollToSection = useCallback(
    (
      moduleSlug: string,
      submoduleSlug: string,
      behavior: ScrollBehavior = "smooth"
    ) => {
      const sectionId = getSectionId(moduleSlug, submoduleSlug);
      const container = scrollContainerRef.current;

      if (!container) return;

      const lockMs =
        behavior === "smooth" ? MANUAL_LOCK_SMOOTH_MS : MANUAL_LOCK_AUTO_MS;

      lockNavigation(sectionId, lockMs);

      const href = `/docs/${moduleSlug}/${submoduleSlug}`;
      lastUrlRef.current = href;
      if (window.location.pathname !== href) {
        router.replace(href, { scroll: false });
      }

      const tryScroll = (attempt: number) => {
        const el =
          sectionElementsRef.current.get(sectionId) ??
          document.getElementById(sectionId);

        if (el) {
          if (container.contains(el)) {
            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const offset =
              elRect.top - containerRect.top + container.scrollTop - 12;

            container.scrollTo({
              top: Math.max(0, offset),
              behavior,
            });
          } else {
            el.scrollIntoView({
              behavior,
              block: "start",
              inline: "nearest",
            });
          }
          return;
        }

        if (attempt < 72) {
          requestAnimationFrame(() => tryScroll(attempt + 1));
        }
      };

      queueMicrotask(() => tryScroll(0));
      requestAnimationFrame(() => tryScroll(0));
    },
    [router, lockNavigation]
  );

  const value = useMemo(
    () => ({
      sections,
      activeSectionId,
      scrollContainerRef,
      setActiveSectionId,
      scrollToSection,
      isNavigationLocked,
      getLockedSectionId,
      registerSectionElement,
      computeActiveSectionFromScroll,
    }),
    [
      sections,
      activeSectionId,
      setActiveSectionId,
      scrollToSection,
      isNavigationLocked,
      getLockedSectionId,
      registerSectionElement,
      computeActiveSectionFromScroll,
    ]
  );

  return (
    <DocsScrollContext.Provider value={value}>
      {children}
    </DocsScrollContext.Provider>
  );
}

export function useDocsScroll() {
  const ctx = useContext(DocsScrollContext);
  if (!ctx) {
    throw new Error("useDocsScroll must be used within DocsScrollProvider");
  }
  return ctx;
}

export function useDocsScrollOptional() {
  return useContext(DocsScrollContext);
}
