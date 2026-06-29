import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '../../lib/utils'
import {
  richTextContentVariants,
  type RichTextContentVariantProps,
} from './rich-text-content.variants'

export type MarkdownContentProps = React.HTMLAttributes<HTMLDivElement> &
  RichTextContentVariantProps & {
    /** Markdown source string — rendered with GFM (tables, task lists, strikethrough). */
    markdown: string
  }

function MarkdownLink({
  href,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'a'> & { href?: string }) {
  const isExternal = href != null && /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      {...props}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

/**
 * Renders markdown with `@tailwindcss/typography` prose styles matching
 * `RichTextContent`. Does not enable raw HTML — markdown only.
 */
export function MarkdownContent({
  markdown,
  size,
  tone,
  className,
  ...props
}: MarkdownContentProps) {
  const trimmed = markdown.trim()
  if (trimmed === '') return null

  return (
    <div className={cn(richTextContentVariants({ size, tone }), className)} {...props}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: MarkdownLink,
        }}
      >
        {trimmed}
      </ReactMarkdown>
    </div>
  )
}
