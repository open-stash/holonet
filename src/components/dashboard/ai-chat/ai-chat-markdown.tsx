import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const proseClassName = cn(
  "prose prose-sm prose-slate max-w-none text-sm leading-relaxed",
  "prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5",
  "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
  "prose-pre:my-2 prose-pre:rounded-lg prose-pre:bg-slate-900 prose-pre:text-slate-50",
  "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5",
  "prose-code:before:content-none prose-code:after:content-none",
  "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
);

/**
 * Renders an assistant reply's markdown. Citation markers like [1] or [1, 2] stay as
 * plain numbers in the text; use the footer sources control to browse all sources.
 */
export function AiChatMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn(proseClassName, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
