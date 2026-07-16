/**
 * Canonical Layer 1 palette primitive names — both `:root` and `.dark` must
 * define every entry. Used by palette-parity tests and Storybook catalog.
 */

export const PALETTE_NEUTRAL_STEPS = [
  'neutral-hue',
  'neutral-0',
  'neutral-50',
  'neutral-100',
  'neutral-150',
  'neutral-200',
  'neutral-300',
  'neutral-500',
  'neutral-700',
  'neutral-750',
  'neutral-800',
  'neutral-800-muted',
  'neutral-900',
  'neutral-950',
  'muted-foreground',
] as const

export const PALETTE_SURFACE_STEPS = [
  'page-surface',
  'sidebar-surface',
  'sidebar-shade',
  'card-surface',
  'muted-surface',
  'accent-surface',
  'secondary-surface',
] as const

export const PALETTE_CHROME_STEPS = [
  'border-default',
  'border-input',
  'border-selected',
  'overlay',
] as const

export const PALETTE_BRAND_STEPS = ['primary', 'primary-foreground', 'on-solid'] as const

export const PALETTE_STATUS_STEPS = [
  'destructive',
  'destructive-muted',
  'destructive-subtle',
  'info',
  'info-muted',
  'info-subtle',
  'success',
  'success-muted',
  'success-subtle',
  'warning',
  'warning-muted',
  'warning-subtle',
] as const

export const PALETTE_SEMANTIC_TEXT_STEPS = [
  'semantic-neutral',
  'semantic-informative',
  'semantic-informative-muted',
  'semantic-positive',
  'semantic-caution',
  'semantic-negative',
  'semantic-negative-on-subtle',
] as const

export const PALETTE_PRIMITIVE_STEPS = [
  ...PALETTE_NEUTRAL_STEPS,
  ...PALETTE_SURFACE_STEPS,
  ...PALETTE_CHROME_STEPS,
  ...PALETTE_BRAND_STEPS,
  ...PALETTE_STATUS_STEPS,
  ...PALETTE_SEMANTIC_TEXT_STEPS,
] as const

/** Full CSS custom property names (with `--palette-` prefix). */
export const PALETTE_PRIMITIVE_VARS: readonly string[] = PALETTE_PRIMITIVE_STEPS.map(
  (step) => `--palette-${step}`,
)

export interface PalettePrimitiveGroup {
  id: string
  label: string
  description?: string
  steps: readonly string[]
}

export const PALETTE_PRIMITIVE_GROUPS: PalettePrimitiveGroup[] = [
  {
    id: 'neutral',
    label: 'Neutral ramp',
    description: 'Full neutral scale — both themes define every step.',
    steps: PALETTE_NEUTRAL_STEPS,
  },
  {
    id: 'surface',
    label: 'Layout surfaces',
    description: 'Page, chrome, and elevation planes.',
    steps: PALETTE_SURFACE_STEPS,
  },
  {
    id: 'chrome',
    label: 'Chrome',
    steps: PALETTE_CHROME_STEPS,
  },
  {
    id: 'brand',
    label: 'Brand',
    steps: PALETTE_BRAND_STEPS,
  },
  {
    id: 'status',
    label: 'Status',
    steps: PALETTE_STATUS_STEPS,
  },
  {
    id: 'semantic-text',
    label: 'Semantic text (palette)',
    description: 'Source hues for inline semantic copy — mapped by Layer 2 roles.',
    steps: PALETTE_SEMANTIC_TEXT_STEPS,
  },
]
