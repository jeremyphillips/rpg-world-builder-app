import { cva } from 'class-variance-authority'

/**
 * Shared presentation for textual interactive controls — inline links, standalone
 * text actions, and rich-text anchors (via CSS utilities in `globals.css`).
 *
 * Decoration + ink only. Geometry, focus rings, and disabled behavior stay on
 * the semantic wrapper (`Button`, `Link`, …).
 */
const textActionVariantsCva = cva('font-body-emphasis transition-colors', {
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
})

export type TextActionTone = 'accent' | 'neutral' | 'danger'
export type TextActionContext = 'inline' | 'standalone'

export type TextActionVariantProps = {
  context?: TextActionContext
  tone?: TextActionTone
}

/** Resolves tone when callers omit it — inline accent, standalone neutral. */
export function resolveTextActionTone(
  context: TextActionContext,
  tone?: TextActionTone,
): TextActionTone {
  return tone ?? (context === 'inline' ? 'accent' : 'neutral')
}

/** Context-aware text-action classes — always resolves omitted tone from context. */
export function textActionVariants({ context = 'inline', tone }: TextActionVariantProps = {}) {
  return textActionVariantsCva({ context, tone: resolveTextActionTone(context, tone) })
}

/** Router-link helper — standalone text actions without Button geometry. */
export function standaloneTextActionClasses(tone?: TextActionTone) {
  return textActionVariants({ context: 'standalone', tone })
}
