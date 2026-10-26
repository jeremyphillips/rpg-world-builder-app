import { semanticTextVariants } from './semantic-text.variants'

export const SEMANTIC_TEXT_CLASS_SPECS = [
  {
    key: 'neutral',
    className: semanticTextVariants({ tone: 'neutral' }),
    keyValues: 'muted mix, medium weight — typography from owner',
    useCase: 'Secondary metadata',
  },
  {
    key: 'info-low',
    className: semanticTextVariants({ tone: 'info', emphasis: 'low' }),
    keyValues: 'info-muted color, normal weight',
    useCase: 'Quiet informational line',
  },
  {
    key: 'warning-icon',
    className: `${semanticTextVariants({ tone: 'warning' })} ui-semantic-text--with-icon`,
    keyValues: 'warning color, icon gap',
    useCase: 'Status with a leading glyph',
  },
] as const
