import { cva, type VariantProps } from 'class-variance-authority'

export const PANEL_TONES = ['transparent', 'quiet', 'subtle', 'strong', 'faint'] as const
export type PanelTone = (typeof PANEL_TONES)[number]

export const PANEL_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type PanelDensity = (typeof PANEL_DENSITIES)[number]

export const panelVariants = cva('ui-panel', {
  variants: {
    tone: {
      transparent: 'ui-panel--transparent ui-border--subtle',
      quiet: 'ui-panel--quiet ui-border--default',
      subtle: 'ui-panel--subtle ui-border--default',
      strong: 'ui-panel--strong ui-border--default',
      faint: 'ui-panel--faint ui-border--default',
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
