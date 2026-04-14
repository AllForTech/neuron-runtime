'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { JsonRenderer } from '@/components/JsonRenederer';
import { OutputFormatType } from '../../../../../shared/src/types/node.types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface OutputRendererProps {
  content: string;
  format: {
    type: OutputFormatType;
    syntaxHighlight?: boolean;
    minify?: boolean;
  };
}

export const OutputRenderer = ({ content, format }: OutputRendererProps) => {
  const isJson = format.type === 'json';
  const isMarkdown = format.type === 'markdown';

  return (
    <div className="flex h-full w-full flex-col bg-transparent selection:bg-blue-500/30">
      {/* 1. MINIMAL CONTENT ENGINE */}
      <div className="custom-scrollbar group relative flex-1 overflow-y-auto">
        <div className="relative z-10">
          {isJson ? (
            <div className="font-mono text-[12px] leading-relaxed text-blue-400/90">
              <JsonRenderer
                data={JSON.parse(content)}
                maxHeight="none" // Let parent handle scrolling
                className="w-full border-none bg-transparent p-0 shadow-none"
              />
            </div>
          ) : isMarkdown ? (
            <article className="prose prose-invert prose-sm prose-p:text-neutral-400 prose-p:leading-relaxed prose-headings:text-neutral-100 prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-blue-400 prose-code:text-emerald-400 prose-code:bg-emerald-500/5 prose-code:px-1 prose-code:rounded-sm prose-pre:bg-neutral-900/50 prose-pre:border prose-pre:border-neutral-800 max-w-none font-sans">
              <ReactMarkdown
                components={{
                  // Style H1
                  h1: ({ node, ...props }) => (
                    <h1
                      className="mt-8 mb-2 text-[1.875rem] leading-[1.3] font-bold tracking-tight text-white"
                      {...props}
                    />
                  ),
                  // Notion H2: Smaller but distinct
                  h2: ({ node, ...props }) => (
                    <h2
                      className="mt-6 mb-1.5 text-[1.5rem] leading-[1.3] font-semibold text-white/90"
                      {...props}
                    />
                  ),
                  // Notion H3: Bold and compact
                  h3: ({ node, ...props }) => (
                    <h3
                      className="mt-4 mb-1 text-[1.25rem] leading-[1.3] font-semibold text-white/85"
                      {...props}
                    />
                  ),
                  // Notion Paragraph: Soft gray, high readability
                  p: ({ node, ...props }) => (
                    <p
                      className="mb-[0.5em] text-[16px] leading-[1.6] font-normal text-neutral-400"
                      {...props}
                    />
                  ),
                  // Notion Lists
                  ul: ({ node, ...props }) => (
                    <ul
                      className="mb-4 list-inside list-disc space-y-1.5 pl-1 text-neutral-400"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="mb-4 list-inside list-decimal space-y-1.5 pl-1 text-neutral-400"
                      {...props}
                    />
                  ),
                  // Style Code Blocks
                  code: ({ node, ...props }) => (
                    <code
                      className={`rounded bg-neutral-800 px-1 py-0.5 font-mono text-emerald-400`}
                      {...props}
                    />
                  ),
                  // Style Lists
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="my-4 border-l-[3px] border-neutral-700 py-0.5 pl-4 text-neutral-400 italic"
                      {...props}
                    />
                  ),
                  // Notion Links: Underlined and subtle
                  a: ({ node, ...props }) => (
                    <a
                      className="text-neutral-300 underline decoration-neutral-600 underline-offset-[3px] transition-colors hover:text-blue-400"
                      {...props}
                    />
                  ),
                  img: ({ node, ...props }) => (
                    <div className="relative my-8 aspect-video w-full overflow-hidden rounded-xl">
                      <Image
                        fill
                        priority
                        alt={props.alt || 'Image'}
                        className="object-cover"
                        src={props.src || ''}
                      />
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          ) : (
            <pre className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-neutral-400">
              {content}
            </pre>
          )}
        </div>
      </div>

      {/* 2. PRECISION STATUS LINE (Single minimal line at bottom) */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-800/50 pt-3 opacity-40 transition-opacity duration-500 group-hover:opacity-100">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-blue-500" />
          <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase">
            Payload::{format.type}
          </span>
        </div>
        <span className="font-mono text-[9px] text-neutral-600 uppercase">
          {new TextEncoder().encode(content).length} bytes
        </span>
      </div>
    </div>
  );
};
