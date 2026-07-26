/**
 * Canonical Layer 1 theme palette role names — both `:root` and `.dark` must
 * define every entry. Used by palette-parity tests and Storybook catalog.
 */

export const PALETTE_WARMTH_STEPS = ['neutral-hue', 'neutral-contrast'] as const

export const PALETTE_SURFACE_ELEVATION_STEPS = [
  'surface-base',
  'surface-faint',
  'surface-subtle',
  'surface-muted',
  'surface-strong',
  'surface-panel',
  'surface-field',
  'surface-sunken',
  'surface-secondary',
  'surface-accent',
] as const

export const PALETTE_FIELD_STEPS = [
  'field-bg',
  'field-border',
  'field-border-hover',
  'field-fg-disabled',
  'field-bg-readonly',
  'field-border-readonly',
  'field-bg-disabled',
  'field-border-disabled',
  'field-placeholder',
] as const

export const PALETTE_SWITCH_STEPS = [
  'switch-track',
  'switch-track-hover',
  'switch-track-disabled',
] as const

export const PALETTE_SIDEBAR_STEPS = ['sidebar-surface', 'sidebar-shade'] as const

export const PALETTE_FG_STEPS = [
  'fg-default',
  'fg-muted',
  'fg-disabled',
  'fg-on-solid',
  'fg-on-status',
] as const

export const PALETTE_CHROME_STEPS = [
  'border-faint',
  'border-default',
  'border-subtle',
  'border-strong',
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
  'warning-faint',
] as const

export const PALETTE_SEMANTIC_TEXT_STEPS = [
  'semantic-neutral',
  'semantic-info',
  'semantic-info-muted',
  'semantic-success',
  'semantic-warning',
  'semantic-warning-accent-faint',
  'semantic-destructive',
  'semantic-destructive-on-subtle',
] as const

export const PALETTE_PRIMITIVE_STEPS = [
  ...PALETTE_WARMTH_STEPS,
  ...PALETTE_SURFACE_ELEVATION_STEPS,
  ...PALETTE_FIELD_STEPS,
  ...PALETTE_SWITCH_STEPS,
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

/** Layer 1 tokens removed by the neutral foundation reset — absence tests guard these. */
export const DEPRECATED_PALETTE_TOKENS = [
  '--palette-surface-raised',
  '--palette-fg-secondary',
  '--palette-control-hover-bg',
  '--palette-control-selected-bg',
  '--palette-row-hover-bg',
  '--palette-row-selected-bg',
  '--palette-row-selected-border',
  '--palette-drop-target-bg',
  '--palette-drop-target-border',
  '--palette-segmented-track-bg',
] as const

export const DEPRECATED_PALETTE_TOKEN_PREFIXES = ['--palette-field-bg-on-'] as const

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
    description:
      'Hue and contrast ingredients for color-mix recipes (sidebar, washes, derived borders).',
    steps: PALETTE_WARMTH_STEPS,
  },
  {
    id: 'elevation',
    label: 'Elevation surfaces',
    description:
      'Authored canvas/panel/field anchors plus formula-derived wash ladder; sunken recessed.',
    steps: PALETTE_SURFACE_ELEVATION_STEPS,
  },
  {
    id: 'field',
    label: 'Field control',
    description: 'Editable control fill, stroke, and state-specific values.',
    steps: PALETTE_FIELD_STEPS,
  },
  {
    id: 'switch',
    label: 'Switch',
    description: 'Unchecked track values — separate from field border ownership.',
    steps: PALETTE_SWITCH_STEPS,
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    steps: PALETTE_SIDEBAR_STEPS,
  },
  {
    id: 'foreground',
    label: 'Foreground',
    description: 'Text roles — fg-muted/disabled derived from fg-default toward canvas.',
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
    description: 'Source hues for inline semantic copy — mapped by Layer 2 `--semantic-*` roles.',
    steps: PALETTE_SEMANTIC_TEXT_STEPS,
  },
]

/** Elevation ladder order for Storybook stacked previews (base → panel). */
export const PALETTE_ELEVATION_LADDER: readonly string[] = [
  'surface-base',
  'surface-faint',
  'surface-subtle',
  'surface-muted',
  'surface-strong',
  'surface-panel',
  'surface-sunken',
]

/** Required Layer 2 field-control role names (both themes). */
export const FIELD_CONTROL_SEMANTIC_ROLES = [
  '--field-control-bg',
  '--field-control-bg-default',
  '--field-control-bg-on-muted',
  '--field-control-fg',
  '--field-control-border',
  '--field-control-placeholder',
  '--field-control-bg-hover',
  '--field-control-border-hover',
  '--field-control-bg-focus',
  '--field-control-border-focus',
  '--field-control-ring-focus',
  '--field-control-bg-readonly',
  '--field-control-fg-readonly',
  '--field-control-border-readonly',
  '--field-control-bg-disabled',
  '--field-control-fg-disabled',
  '--field-control-border-disabled',
  '--field-control-bg-invalid',
  '--field-control-border-invalid',
  '--field-control-ring-invalid',
] as const

/** Layer 2 choice-indicator roles composed in semantic-*.css (not field-input chrome). */
export const CHOICE_CONTROL_SEMANTIC_ROLES = ['--choice-control-border'] as const

/** Layer 2 outline button recipe roles composed in semantic-*.css. */
export const OUTLINE_BUTTON_SEMANTIC_ROLES = [
  '--outline-control-border',
  '--outline-button-border',
  '--outline-button-hover-bg',
  '--outline-button-active-bg',
] as const

/** Layer 2 interaction recipe roles composed in semantic-*.css (not Layer 1). */
export const INTERACTION_SEMANTIC_ROLES = [
  '--control-hover-bg',
  '--control-selected-bg',
  '--row-hover-bg',
  '--row-selected-bg',
  '--row-selected-border',
  '--drop-target-bg',
  '--drop-target-border',
  '--segmented-track-bg',
] as const
