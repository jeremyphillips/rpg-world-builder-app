import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { type FieldSizeToken } from './field-sizing.variants'

const PROSE_MUTED_TOKENS =
  '[--tw-prose-body:var(--color-muted-foreground)] [--tw-prose-headings:var(--color-muted-foreground)] [--tw-prose-bold:var(--color-muted-foreground)] text-muted-foreground'

/** Base `prose` classes for TipTap HTML — shared by read and edit surfaces. */
export const richTextProseBase = 'prose max-w-none [&_p_strong]:text-foreground'

/** Maps field size tokens to typography plugin prose modifiers. */
export const richTextProseSizeClasses = {
  sm: 'prose-sm',
  md: 'prose-md',
  lg: '',
} as const satisfies Record<FieldSizeToken, string>

/** ProseMirror root classes — WYSIWYG aligns with `RichTextContent` at the same size. */
export function richTextEditorProseClasses(size: FieldSizeToken = 'md'): string {
  return cn(
    richTextProseBase,
    richTextProseSizeClasses[size],
    'min-h-20 w-full px-3 py-2 focus:outline-none',
  )
}

export const richTextContentVariants = cva(richTextProseBase, {
  variants: {
    size: {
      base: '',
      sm: 'prose-sm',
      md: 'prose-md',
    },
    tone: {
      default: '',
      muted: PROSE_MUTED_TOKENS,
    },
  },
  defaultVariants: {
    size: 'base',
    tone: 'default',
  },
})

export type RichTextContentVariantProps = VariantProps<typeof richTextContentVariants>
