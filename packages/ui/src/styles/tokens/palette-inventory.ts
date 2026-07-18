/**
 * Canonical Layer 1 palette primitive names — both `:root` and `.dark` must
 * define every entry. Used by palette-parity tests and Storybook catalog.
 */

export const PALETTE_WARMTH_STEPS = ['neutral-hue'] as const

export const PALETTE_SURFACE_ELEVATION_STEPS = [
  'surface-base',
  'surface-subtle',
  'surface-raised',
  'surface-sunken',
  'surface-secondary',
  'surface-accent',
  'surface-input',
] as const

export const PALETTE_SIDEBAR_STEPS = ['sidebar-surface', 'sidebar-shade'] as const

export const PALETTE_FG_STEPS = [
  'fg-default',
  'fg-muted',
  'fg-secondary',
  'fg-on-solid',
  'fg-on-status',
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
  ...PALETTE_WARMTH_STEPS,
  ...PALETTE_SURFACE_ELEVATION_STEPS,
  ...PALETTE_SIDEBAR_STEPS,
  ...PALETTE_FG_STEPS,
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
    id: 'warmth',
    label: 'Warmth anchor',
    description: 'Hue anchor for color-mix recipes (sidebar, overlay).',
    steps: PALETTE_WARMTH_STEPS,
  },
  {
    id: 'elevation',
    label: 'Elevation surfaces',
    description: 'Canvas → subtle → raised; sunken recessed plane.',
    steps: PALETTE_SURFACE_ELEVATION_STEPS,
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    steps: PALETTE_SIDEBAR_STEPS,
  },
  {
    id: 'foreground',
    label: 'Foreground',
    description: 'Text roles — same names across themes, different oklch per theme.',
    steps: PALETTE_FG_STEPS,
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

/** Elevation ladder order for Storybook stacked previews (base → raised). */
export const PALETTE_ELEVATION_LADDER: readonly string[] = [
  'surface-base',
  'surface-subtle',
  'surface-raised',
  'surface-sunken',
]
