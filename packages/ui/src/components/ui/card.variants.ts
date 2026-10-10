import { cn } from '../../lib/utils'

/** Shared with option-card shells until that owner migrates. Card itself uses `ui-card`. */
export const cardRadiusClasses = 'rounded-card'

/** Shared with option-card shells until that owner migrates. Card itself uses `ui-card`. */
export const cardBorderClasses = 'border border-card-border'

export const UI_CARD_CLASS = 'ui-card' as const

export const UI_CARD_HEADER_CLASS = 'ui-card__header' as const
export const UI_CARD_CONTENT_CLASS = 'ui-card__content' as const
export const UI_CARD_FOOTER_CLASS = 'ui-card__footer' as const

export type CardSurfaceVariantProps = {
  /** Navigation and destination cards. Hover wash is `--row-hover-bg`. */
  interactive?: boolean
}

/** Styling primitive for card chrome without rendering `Card`. */
export function cardSurfaceVariants({ interactive = false }: CardSurfaceVariantProps = {}): string {
  return cn(UI_CARD_CLASS, interactive ? 'ui-card--interactive' : 'ui-card--static')
}

/** Default card chrome. */
export const cardSurfaceClasses = cardSurfaceVariants()

export type CardClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const CARD_CLASS_SPECS: readonly CardClassSpec[] = [
  {
    key: 'static',
    className: cardSurfaceVariants(),
    keyValues: 'radius --radius-card, shadow --shadow-surface-raised',
    useCase: 'Information card',
  },
  {
    key: 'interactive',
    className: cardSurfaceVariants({ interactive: true }),
    keyValues: 'hover --row-hover-bg',
    useCase: 'Navigation card',
  },
]
