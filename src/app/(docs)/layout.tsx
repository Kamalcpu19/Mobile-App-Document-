import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { getModules } from "@/lib/docs";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = getModules();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar modules={modules} />
        <main className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 xl:max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
