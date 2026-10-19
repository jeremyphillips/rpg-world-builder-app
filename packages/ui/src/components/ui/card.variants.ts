import { cn } from '../../lib/utils'

/** Shared with preview rail until that owner migrates. Card itself uses `ui-card`. */
export const cardRadiusClasses = 'rounded-card'

/** @deprecated Option shells migrated to `ui-card`; retained for preview rail. */
export const cardBorderClasses = 'border border-card-border'

export const CARD_SURFACE_TONES = ['quiet', 'strong'] as const
export type CardSurfaceTone = (typeof CARD_SURFACE_TONES)[number]

export const UI_CARD_CLASS = 'ui-card' as const

export const UI_CARD_HEADER_CLASS = 'ui-card__header' as const
export const UI_CARD_CONTENT_CLASS = 'ui-card__content' as const
export const UI_CARD_FOOTER_CLASS = 'ui-card__footer' as const
export const UI_CARD_TITLE_CLASS = 'ui-card__title' as const
export const UI_CARD_DESCRIPTION_CLASS = 'ui-card__description' as const

export const UI_CARD_NAV_CLASS = 'ui-card__nav' as const
export const UI_CARD_NAV_MAIN_CLASS = 'ui-card__nav-main' as const
export const UI_CARD_NAV_CHEVRON_CLASS = 'ui-card__nav-chevron' as const

export const CARD_INSET_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type CardInsetDensity = (typeof CARD_INSET_DENSITIES)[number]

/** Generic `Card` `density` prop — same values as {@link CardInsetDensity}. */
export type GenericCardDensity = CardInsetDensity

/** @deprecated Use {@link CARD_INSET_DENSITIES} / {@link CardInsetDensity}. */
export const CARD_DENSITIES = CARD_INSET_DENSITIES
/** @deprecated Use {@link CardInsetDensity} or {@link GenericCardDensity}. */
export type CardDensity = CardInsetDensity

export const UI_CARD_DENSITY_COMPACT_CLASS = 'ui-card--compact' as const
export const UI_CARD_DENSITY_COMFORTABLE_CLASS = 'ui-card--comfortable' as const
export const UI_CARD_DENSITY_SPACIOUS_CLASS = 'ui-card--spacious' as const

export const UI_CONTENT_CARD_INSET_CLASS = 'ui-content-card-inset' as const

export type ContentCardInsetDensity = Exclude<CardInsetDensity, 'spacious'>

/** Maps option-card `comfortable` density to the shared comfortable inset step. */
export function resolveOptionCardSurfaceDensity(
  density: 'comfortable' | 'compact',
): ContentCardInsetDensity {
  return density === 'compact' ? 'compact' : 'comfortable'
}

export function cardDensityClassName(density: CardInsetDensity = 'comfortable'): string {
  if (density === 'compact') {
    return UI_CARD_DENSITY_COMPACT_CLASS
  }
  if (density === 'spacious') {
    return UI_CARD_DENSITY_SPACIOUS_CLASS
  }
  return UI_CARD_DENSITY_COMFORTABLE_CLASS
}

export type CardSurfaceVariantProps = {
  /** Omitted: generic Card look (information / navigation). */
  tone?: CardSurfaceTone
  /** Baseline content inset + header copy ladder — independent of tone. */
  density?: CardInsetDensity
  /** Enables the CSS :hover ladder. Static cards never get hover. */
  interactive?: boolean
  /** Supplied by the interaction owner (radio group value), never by consumers. */
  selected?: boolean
  disabled?: boolean
}

/** Styling primitive for card chrome without rendering `Card`. */
export function cardSurfaceVariants({
  tone,
  density = 'comfortable',
  interactive = false,
  selected = false,
  disabled = false,
}: CardSurfaceVariantProps = {}): string {
  return cn(
    UI_CARD_CLASS,
    cardDensityClassName(density),
    tone && `ui-card--${tone}`,
    interactive ? 'ui-card--interactive' : 'ui-card--static',
    selected && tone && 'ui-card--selected',
    disabled && 'ui-card--disabled',
  )
}

/** Default card chrome. */
export const cardSurfaceClasses = cardSurfaceVariants()

export type CardClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

const CARD_TONE_STATE_MATRIX: readonly {
  key: string
  tone?: CardSurfaceTone
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  useCase: string
  keyValues: string
}[] = [
  {
    key: 'quiet-rest',
    tone: 'quiet',
    useCase: 'Drawer / entity row rest',
    keyValues: 'bg host plane when `.ui-card-tone-host--inherit`, else --card; border --border',
  },
  {
    key: 'quiet-hover',
    tone: 'quiet',
    interactive: true,
    useCase: 'Selectable quiet row hover',
    keyValues: 'hover --row-hover-bg',
  },
  {
    key: 'quiet-selected',
    tone: 'quiet',
    interactive: true,
    selected: true,
    useCase: 'Selected quiet row',
    keyValues: 'bg --row-selected-bg, border --primary',
  },
  {
    key: 'quiet-disabled',
    tone: 'quiet',
    interactive: true,
    disabled: true,
    useCase: 'Disabled quiet row',
    keyValues: 'opacity 0.5',
  },
  {
    key: 'strong-rest',
    tone: 'strong',
    useCase: 'Builder step option rest',
    keyValues: 'bg --surface-muted, border --border, soft drop shadow',
  },
  {
    key: 'strong-hover',
    tone: 'strong',
    interactive: true,
    useCase: 'Strong option hover',
    keyValues: 'hover --surface-subtle, border --primary',
  },
  {
    key: 'strong-selected',
    tone: 'strong',
    interactive: true,
    selected: true,
    useCase: 'Selected strong option',
    keyValues: 'bg --surface-strong, ring primary/20',
  },
  {
    key: 'strong-disabled',
    tone: 'strong',
    interactive: true,
    disabled: true,
    useCase: 'Disabled strong option',
    keyValues: 'opacity 0.5',
  },
  {
    key: 'static',
    useCase: 'Information card (untone)',
    keyValues: 'radius --radius-card, shadow --shadow-surface-raised',
  },
  {
    key: 'interactive',
    interactive: true,
    useCase: 'Navigation card (untone)',
    keyValues: 'hover --row-hover-bg',
  },
]

export const CARD_CLASS_SPECS: readonly CardClassSpec[] = CARD_TONE_STATE_MATRIX.map((entry) => ({
  key: entry.key,
  className: cardSurfaceVariants({
    tone: entry.tone,
    interactive: entry.interactive,
    selected: entry.selected,
    disabled: entry.disabled,
  }),
  keyValues: entry.keyValues,
  useCase: entry.useCase,
}))
