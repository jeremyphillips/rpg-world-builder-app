import * as React from 'react'

import { sanitizeHtml } from '../../lib/sanitize-html'
import { cn } from '../../lib/utils'
import {
  richTextContentVariants,
  type RichTextContentVariantProps,
} from './rich-text-content.variants'

export type RichTextContentProps = React.HTMLAttributes<HTMLDivElement> &
  RichTextContentVariantProps & {
    /** HTML string from the rich-text editor or CMS — sanitized before render. */
    html: string
  }

/**
 * Renders sanitized rich-text HTML with `@tailwindcss/typography` prose styles.
 * Use for TipTap / CMS output only — app chrome copy belongs on `Heading` / `Text`.
 */
export function RichTextContent({ html, size, tone, className, ...props }: RichTextContentProps) {
  if (!html) return null

  return (
    <div
      className={cn(richTextContentVariants({ size, tone }), className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      {...props}
    />
  )
}
