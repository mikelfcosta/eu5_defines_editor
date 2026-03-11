import type { ReactElement } from "react";
import docsGettingStarted from "../../content/docs/getting-started.md?raw";
import docsInstallMod from "../../content/docs/install-mod.md?raw";
import docsUsingEditor from "../../content/docs/using-editor.md?raw";
import docsExporting from "../../content/docs/exporting-versioning.md?raw";
import { DocsArticle } from "./components/DocsArticle";

export interface DocsPageDefinition {
  path: string;
  title: string;
  markdown: string;
}

export const docsPages: DocsPageDefinition[] = [
  { path: "/docs/getting-started", title: "Getting Started", markdown: docsGettingStarted },
  { path: "/docs/install-mod", title: "How to Install a Mod", markdown: docsInstallMod },
  { path: "/docs/using-editor", title: "Using the Editor", markdown: docsUsingEditor },
  { path: "/docs/exporting-versioning", title: "Exporting and Versioning", markdown: docsExporting }
];

interface DocsRoutePageProps {
  title: string;
  markdown: string;
}

export function DocsRoutePage({ title, markdown }: DocsRoutePageProps): ReactElement {
  return <DocsArticle title={title} markdown={markdown} />;
}
