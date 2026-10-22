import { cva, type VariantProps } from 'class-variance-authority'

export const PANEL_TONES = ['transparent', 'quiet', 'subtle', 'strong', 'faint'] as const
export type PanelTone = (typeof PANEL_TONES)[number]

export const PANEL_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type PanelDensity = (typeof PANEL_DENSITIES)[number]

export const panelVariants = cva('ui-panel', {
  variants: {
    tone: {
      transparent: 'ui-panel--transparent',
      quiet: 'ui-panel--quiet',
      subtle: 'ui-panel--subtle',
      strong: 'ui-panel--strong',
      faint: 'ui-panel--faint',
    },
    density: {
      compact: 'ui-panel--compact',
      comfortable: 'ui-panel--comfortable',
      spacious: 'ui-panel--spacious',
    },
    bleed: {
      true: 'ui-panel--bleed',
      false: '',
    },
  },
  defaultVariants: {
    tone: 'transparent',
    density: 'comfortable',
    bleed: false,
  },
})

export type PanelVariantProps = VariantProps<typeof panelVariants>

/** Padding for sections inside a bleed `Panel` (inherits `--ui-surface-inset-*` from host density). */
export const panelSectionInsetClasses = 'ui-panel-section-inset'
