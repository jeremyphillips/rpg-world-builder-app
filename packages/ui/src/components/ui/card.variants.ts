import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'

export const CARD_SURFACE_TONES = ['transparent', 'quiet', 'subtle', 'strong'] as const
export type CardSurfaceTone = (typeof CARD_SURFACE_TONES)[number]
/** @alias CardSurfaceTone */
export type CardTone = CardSurfaceTone

export const CARD_ELEVATIONS = ['flat', 'subtle', 'raised'] as const
export type CardElevation = (typeof CARD_ELEVATIONS)[number]

export const CARD_INSET_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type CardInsetDensity = (typeof CARD_INSET_DENSITIES)[number]

/** Generic `Card` `density` prop — same values as {@link CardInsetDensity}. */
export type GenericCardDensity = CardInsetDensity

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
    return 'ui-card--compact'
  }
  if (density === 'spacious') {
    return 'ui-card--spacious'
  }
  return 'ui-card--comfortable'
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
    return 'ui-card--elevation-subtle'
  }
  if (elevation === 'raised') {
    return 'ui-card--elevation-raised'
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
    'ui-card',
    borderStrength(),
    cardDensityClassName(density),
    `ui-card--${tone}`,
    cardElevationClassName(elevation),
    interactive ? 'ui-card--interactive' : 'ui-card--static',
    selected && 'ui-card--selected',
    disabled && 'ui-card--disabled',
  )
}

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
    key: 'transparent-rest',
    tone: 'transparent',
    useCase: 'Border-only shell on parent surface',
    keyValues: 'bg transparent; --ui-surface-bg transparent; border --border',
  },
  {
    key: 'transparent-hover',
    tone: 'transparent',
    interactive: true,
    useCase: 'Transparent shell hover wash',
    keyValues: 'hover color-mix 94% rest + --palette-neutral-contrast; pressed 88%',
  },
  {
    key: 'transparent-selected',
    tone: 'transparent',
    interactive: true,
    selected: true,
    useCase: 'Selected transparent shell',
    keyValues: 'bg --ui-surface-selected-bg, border --primary',
  },
  {
    key: 'transparent-disabled',
    tone: 'transparent',
    interactive: true,
    disabled: true,
    useCase: 'Disabled transparent shell',
    keyValues: 'opacity 0.5',
  },
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
    key: 'subtle-rest',
    tone: 'subtle',
    useCase: 'Light wash between lift and strong',
    keyValues: 'bg --surface-subtle; border --border',
  },
  {
    key: 'subtle-hover',
    tone: 'subtle',
    interactive: true,
    useCase: 'Subtle tone interactive hover',
    keyValues: 'hover color-mix 94% rest + --palette-neutral-contrast; pressed 88%',
  },
  {
    key: 'subtle-selected',
    tone: 'subtle',
    interactive: true,
    selected: true,
    useCase: 'Selected subtle shell',
    keyValues: 'bg --ui-surface-selected-bg, border --primary',
  },
  {
    key: 'subtle-disabled',
    tone: 'subtle',
    interactive: true,
    disabled: true,
    useCase: 'Disabled subtle shell',
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
