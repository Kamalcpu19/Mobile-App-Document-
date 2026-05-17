import { redirect } from "next/navigation";
import { getModules } from "@/lib/docs";
import { getDocHref } from "@/lib/doc-navigation";

export default function DocsIndexPage() {
  const modules = getModules();
  const firstModule = modules[0];
  const firstSubmodule = firstModule?.submodules[0];

  if (firstModule && firstSubmodule) {
    redirect(getDocHref(firstModule.slug, firstSubmodule.slug));
  }

  redirect("/");
}
