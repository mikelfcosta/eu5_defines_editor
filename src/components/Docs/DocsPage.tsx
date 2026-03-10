import ReactMarkdown from "react-markdown";

interface DocsPageProps {
  title: string;
  markdown: string;
}

export function DocsPage({ title, markdown }: DocsPageProps) {
  return (
    <article className="docs-page">
      <h2>{title}</h2>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </article>
  );
}
