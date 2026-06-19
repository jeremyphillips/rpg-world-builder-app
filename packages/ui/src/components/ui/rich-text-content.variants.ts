import { cva, type VariantProps } from 'class-variance-authority'

const PROSE_MUTED_TOKENS =
  '[--tw-prose-body:var(--color-muted-foreground)] [--tw-prose-headings:var(--color-muted-foreground)] [--tw-prose-bold:var(--color-muted-foreground)] text-muted-foreground'

export const richTextContentVariants = cva('prose max-w-none', {
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
