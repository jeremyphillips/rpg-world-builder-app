import { cva, type VariantProps } from 'class-variance-authority'

export const SEMANTIC_TEXT_TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const

export const SEMANTIC_TEXT_EMPHASES = ['low', 'medium', 'high'] as const

export const UI_SEMANTIC_TEXT_TONE_CLASSES = SEMANTIC_TEXT_TONES.map(
  (tone) => `ui-semantic-text--${tone}` as const,
)

export const UI_SEMANTIC_TEXT_EMPHASIS_CLASSES = SEMANTIC_TEXT_EMPHASES.map(
  (emphasis) => `ui-semantic-text--emphasis-${emphasis}` as const,
)

export const semanticTextVariants = cva('ui-semantic-text', {
  variants: {
    tone: {
      neutral: 'ui-semantic-text--neutral',
      info: 'ui-semantic-text--info',
      success: 'ui-semantic-text--success',
      warning: 'ui-semantic-text--warning',
      destructive: 'ui-semantic-text--destructive',
    },
    emphasis: {
      low: 'ui-semantic-text--emphasis-low',
      medium: 'ui-semantic-text--emphasis-medium',
      high: 'ui-semantic-text--emphasis-high',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    emphasis: 'medium',
  },
})

export type SemanticTextVariantProps = VariantProps<typeof semanticTextVariants>

export type SemanticTextTone = NonNullable<SemanticTextVariantProps['tone']>
export type SemanticTextEmphasis = NonNullable<SemanticTextVariantProps['emphasis']>
