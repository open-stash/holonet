import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders an assistant reply's markdown. react-markdown does not render raw HTML, so
 * this is XSS-safe. Styled with Tailwind Typography (`prose`), tightened for chat. Safe
 * to re-render on every streamed token — partial markdown resolves as more text arrives.
 */
export function AiChatMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-slate max-w-none text-sm leading-relaxed",
        // tighter rhythm than prose defaults so chat doesn't feel airy
        "prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5",
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
        "prose-pre:my-2 prose-pre:rounded-lg prose-pre:bg-slate-900 prose-pre:text-slate-50",
        "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
        className
      )}
    >
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
