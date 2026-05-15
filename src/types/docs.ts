export interface Submodule {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  submodules: Submodule[];
}

export interface DocsNavigation {
  title: string;
  description: string;
  version?: string;
  modules: Module[];
}

export interface DocPageMeta {
  title: string;
  description?: string;
  moduleSlug: string;
  submoduleSlug: string;
  lastUpdated?: string;
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SearchResult {
  type: "module" | "submodule";
  moduleSlug: string;
  submoduleSlug?: string;
  title: string;
  description?: string;
  href: string;
}

export interface DocSection {
  sectionId: string;
  moduleSlug: string;
  submoduleSlug: string;
  moduleTitle: string;
  title: string;
  description?: string;
  lastUpdated?: string;
  content: string;
  href: string;
}
