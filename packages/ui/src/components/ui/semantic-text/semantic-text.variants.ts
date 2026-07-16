import { cva, type VariantProps } from 'class-variance-authority'

export const semanticTextVariants = cva('inline-flex items-center gap-1 text-xs', {
  variants: {
    tone: {
      neutral: 'text-semantic-neutral',
      informative: 'text-semantic-informative',
      positive: 'text-semantic-positive',
      caution: 'text-semantic-caution',
      negative: 'text-semantic-negative',
    },
    emphasis: {
      low: 'font-normal',
      medium: 'font-medium',
      high: 'font-semibold',
    },
  },
  compoundVariants: [
    {
      tone: 'informative',
      emphasis: 'low',
      class: 'text-semantic-informative-muted',
    },
  ],
  defaultVariants: { tone: 'neutral', emphasis: 'medium' },
})

export type SemanticTextVariantProps = VariantProps<typeof semanticTextVariants>

export type SemanticTextTone = NonNullable<SemanticTextVariantProps['tone']>
export type SemanticTextEmphasis = NonNullable<SemanticTextVariantProps['emphasis']>
