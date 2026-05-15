import { getModules, getAllDocSections } from "@/lib/docs";
import { DocsShell } from "@/components/docs/docs-shell";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = getModules();
  const sections = getAllDocSections();

  return (
    <DocsShell modules={modules} sections={sections}>
      {children}
    </DocsShell>
  );
}
