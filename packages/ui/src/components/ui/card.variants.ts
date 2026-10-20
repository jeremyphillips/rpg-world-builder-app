import { cn } from '../../lib/utils'

/** Shared with preview rail until that owner migrates. Card itself uses `ui-card`. */
export const cardRadiusClasses = 'rounded-card'

/** @deprecated Option shells migrated to `ui-card`; retained for preview rail. */
export const cardBorderClasses = 'border border-card-border'

export const CARD_SURFACE_TONES = ['quiet', 'strong'] as const
export type CardSurfaceTone = (typeof CARD_SURFACE_TONES)[number]
/** @alias CardSurfaceTone */
export type CardTone = CardSurfaceTone

export const CARD_ELEVATIONS = ['flat', 'subtle', 'raised'] as const
export type CardElevation = (typeof CARD_ELEVATIONS)[number]

export const UI_CARD_ELEVATION_SUBTLE_CLASS = 'ui-card--elevation-subtle' as const
export const UI_CARD_ELEVATION_RAISED_CLASS = 'ui-card--elevation-raised' as const

export const UI_CARD_CLASS = 'ui-card' as const

export const UI_CARD_MEDIA_CLASS = 'ui-card__media' as const
export const UI_CARD_MEDIA_MODIFIER_CLASS = 'ui-card--media' as const
export const UI_CARD_STRETCH_CLASS = 'ui-card--stretch' as const
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
  tone?: CardSurfaceTone
  elevation?: CardElevation
  /** Baseline content inset + header copy ladder — independent of tone. */
  density?: CardInsetDensity
  /** Enables the CSS :hover ladder. Static cards never get hover. */
  interactive?: boolean
  /** Supplied by the interaction owner (radio group value), never by consumers. */
  selected?: boolean
  disabled?: boolean
}

function cardElevationClassName(elevation: CardElevation = 'flat'): string | undefined {
  if (elevation === 'subtle') {
    return UI_CARD_ELEVATION_SUBTLE_CLASS
  }
  if (elevation === 'raised') {
    return UI_CARD_ELEVATION_RAISED_CLASS
  }
  return undefined
}

/** Styling primitive for card chrome without rendering `Card`. */
export function cardSurfaceVariants({
  tone = 'strong',
  elevation = 'flat',
  density = 'comfortable',
  interactive = false,
  selected = false,
  disabled = false,
}: CardSurfaceVariantProps = {}): string {
  return cn(
    UI_CARD_CLASS,
    cardDensityClassName(density),
    `ui-card--${tone}`,
    cardElevationClassName(elevation),
    interactive ? 'ui-card--interactive' : 'ui-card--static',
    selected && 'ui-card--selected',
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
  elevation?: CardElevation
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
    keyValues: 'bg --surface-lift; border --border',
  },
  {
    key: 'quiet-hover',
    tone: 'quiet',
    interactive: true,
    useCase: 'Selectable quiet row hover',
    keyValues: 'hover color-mix 94% rest + --palette-neutral-contrast; pressed 88%',
  },
  {
    key: 'quiet-selected',
    tone: 'quiet',
    interactive: true,
    selected: true,
    useCase: 'Selected quiet row',
    keyValues: 'bg --ui-surface-selected-bg, border --primary',
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
    useCase: 'Default card / builder option rest (strong + flat)',
    keyValues: 'bg --surface-strong, border --border; elevation flat (no shadow class)',
  },
  {
    key: 'strong-subtle',
    tone: 'strong',
    elevation: 'subtle',
    useCase: 'Light depth without raised inset highlight',
    keyValues: 'elevation --shadow-surface-subtle',
  },
  {
    key: 'strong-raised',
    tone: 'strong',
    elevation: 'raised',
    useCase: 'Selection option card default shell',
    keyValues: 'elevation --shadow-surface-raised',
  },
  {
    key: 'strong-hover',
    tone: 'strong',
    interactive: true,
    useCase: 'Strong option hover',
    keyValues:
      'hover color-mix 94% rest + --palette-neutral-contrast; pressed 88%; border --primary',
  },
  {
    key: 'strong-selected',
    tone: 'strong',
    interactive: true,
    selected: true,
    useCase: 'Selected strong option',
    keyValues: 'bg --ui-surface-selected-bg, ring primary/20',
  },
  {
    key: 'strong-disabled',
    tone: 'strong',
    interactive: true,
    disabled: true,
    useCase: 'Disabled strong option',
    keyValues: 'opacity 0.5',
  },
]

export const CARD_CLASS_SPECS: readonly CardClassSpec[] = CARD_TONE_STATE_MATRIX.map((entry) => ({
  key: entry.key,
  className: cardSurfaceVariants({
    tone: entry.tone,
    elevation: entry.elevation,
    interactive: entry.interactive,
    selected: entry.selected,
    disabled: entry.disabled,
  }),
  keyValues: entry.keyValues,
  useCase: entry.useCase,
}))
