import { cva, type VariantProps } from 'class-variance-authority'

export const semanticTextVariants = cva('inline-flex items-center gap-1 text-xs', {
  variants: {
    tone: {
      neutral: 'text-semantic-neutral',
      info: 'text-semantic-info',
      success: 'text-semantic-success',
      warning: 'text-semantic-warning',
      destructive: 'text-semantic-destructive',
    },
    emphasis: {
      low: 'font-normal',
      medium: 'font-medium',
      high: 'font-semibold',
    },
  },
  compoundVariants: [
    {
      tone: 'info',
      emphasis: 'low',
      class: 'text-semantic-info-muted',
    },
  ],
  defaultVariants: { tone: 'neutral', emphasis: 'medium' },
})

export type SemanticTextVariantProps = VariantProps<typeof semanticTextVariants>

export type SemanticTextTone = NonNullable<SemanticTextVariantProps['tone']>
export type SemanticTextEmphasis = NonNullable<SemanticTextVariantProps['emphasis']>
