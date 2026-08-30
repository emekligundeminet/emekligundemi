"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function YasalMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="yasal-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
