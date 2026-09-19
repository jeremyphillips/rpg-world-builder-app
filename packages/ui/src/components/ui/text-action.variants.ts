import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared presentation for textual interactive controls — inline links, standalone
 * text actions, and rich-text anchors (via CSS utilities in `globals.css`).
 *
 * Decoration + ink only. Geometry, focus rings, and disabled behavior stay on
 * the semantic wrapper (`Button`, `Link`, …).
 */
export const textActionVariants = cva('font-body-emphasis transition-colors', {
  variants: {
    context: {
      inline: 'text-action-inline',
      standalone: 'text-action-standalone',
    },
    tone: {
      accent: 'text-primary',
      neutral: 'text-foreground',
      danger: 'text-destructive',
    },
  },
  defaultVariants: {
    context: 'inline',
    tone: 'accent',
  },
})

export type TextActionVariantProps = VariantProps<typeof textActionVariants>
export type TextActionTone = NonNullable<TextActionVariantProps['tone']>
export type TextActionContext = NonNullable<TextActionVariantProps['context']>

/** Resolves tone when callers omit it — inline accent, standalone neutral. */
export function resolveTextActionTone(
  context: TextActionContext,
  tone?: TextActionTone,
): TextActionTone {
  return tone ?? (context === 'inline' ? 'accent' : 'neutral')
}
