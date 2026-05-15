"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { CodeBlock } from "@/components/docs/code-block";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const components: Components = {
    pre({ children }) {
      return <>{children}</>;
    },
    code({ className: codeClassName, children, ...props }) {
      const match = /language-(\w+)/.exec(codeClassName ?? "");
      const codeString = String(children).replace(/\n$/, "");

      if (match || codeString.includes("\n")) {
        return (
          <CodeBlock language={match?.[1]}>
            {codeString}
          </CodeBlock>
        );
      }

      return (
        <code
          className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    },
    a({ href, children, ...props }) {
      const isExternal =
        typeof href === "string" &&
        (href.startsWith("http") || href.startsWith("//"));

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="font-medium text-primary underline-offset-4 hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1({ children, ...props }) {
      return (
        <h1
          className="my-8 scroll-mt-24 border-b border-border pb-4 text-balance text-3xl font-bold tracking-tight text-foreground first:mt-0 sm:text-4xl [&_a]:cursor-text [&_a]:font-inherit [&_a]:text-inherit [&_a]:no-underline hover:[&_a]:no-underline"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2({ children, ...props }) {
      return (
        <h2
          className="mt-10 scroll-mt-24 text-balance border-b border-border/60 pb-2 text-xl font-semibold tracking-tight text-foreground first:mt-0 sm:text-2xl [&_a]:cursor-text [&_a]:font-inherit [&_a]:text-inherit [&_a]:no-underline hover:[&_a]:no-underline"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      return (
        <h3
          className="mt-8 scroll-mt-24 text-lg font-semibold tracking-tight text-foreground sm:text-xl [&_a]:cursor-text [&_a]:font-inherit [&_a]:text-inherit [&_a]:no-underline hover:[&_a]:no-underline"
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4({ children, ...props }) {
      return (
        <h4
          className="mt-6 scroll-mt-24 text-base font-semibold tracking-tight text-foreground sm:text-lg [&_a]:cursor-text [&_a]:font-inherit [&_a]:text-inherit [&_a]:no-underline hover:[&_a]:no-underline"
          {...props}
        >
          {children}
        </h4>
      );
    },
    table({ children }) {
      return (
        <div className="my-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">{children}</table>
        </div>
      );
    },
    th({ children }) {
      return (
        <th className="border-b border-border bg-muted/50 px-4 py-2 text-left font-semibold">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border-b border-border px-4 py-2">{children}</td>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className="my-4 border-l-4 border-primary/40 bg-muted/30 py-2 pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      );
    },
  };

  return (
    <article
      className={cn(
        "prose prose-slate max-w-none dark:prose-invert prose-docs-markdown",
        "prose-p:leading-relaxed prose-strong:text-foreground",
        "prose-a:text-primary prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:p-0 prose-pre:bg-transparent",
        "prose-headings:text-foreground prose-headings:font-semibold",
        "[&_*]:outline-none [&_summary]:cursor-pointer",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
