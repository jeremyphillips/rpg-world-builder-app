import { cva, type VariantProps } from 'class-variance-authority'

import { textSecondaryBodyClasses } from './text.variants'

const PROSE_MUTED_TOKENS =
  '[--tw-prose-body:var(--color-muted-foreground)] [--tw-prose-headings:var(--color-muted-foreground)] [--tw-prose-bold:var(--color-muted-foreground)] text-muted-foreground'

/** Base `prose` classes for TipTap HTML — shared by read and edit surfaces. */
export const richTextProseBase = 'prose max-w-none'

/**
 * ProseMirror root — matches `RichTextContent` with `size="sm"` so the editor
 * WYSIWYG aligns with catalog detail copy.
 */
export const richTextEditorProseClasses = [
  richTextProseBase,
  'prose-sm',
  `min-h-20 w-full px-3 py-2 ${textSecondaryBodyClasses} focus:outline-none`,
].join(' ')

export const richTextContentVariants = cva(richTextProseBase, {
  variants: {
    size: {
      base: '',
      sm: 'prose-sm',
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
