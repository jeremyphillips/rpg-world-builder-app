import {
  PALETTE_ELEVATION_LADDER,
  PALETTE_PRIMITIVE_GROUPS,
} from '../../styles/tokens/palette-inventory'

/** How the swatch renders the token in Storybook. */
export type ColorTokenUsage = 'background' | 'text' | 'border'

export interface ColorToken {
  /** Human label in the catalog table. */
  name: string
  /** Source CSS custom property (without `var()`). */
  cssVar: `--${string}`
  /** Matching Tailwind utility when mapped in `@theme inline`. */
  tailwind: string
  usage: ColorTokenUsage
  /** Optional paired foreground for text-on-fill samples. */
  foregroundVar?: `--${string}`
  foregroundTailwind?: string
  /** Demo fill behind `usage: 'text'` swatches that are meant for solid/status planes (not canvas). */
  textDemoSurfaceVar?: `--${string}`
}

export interface ColorTokenGroup {
  id: string
  label: string
  description?: string
  tokens: ColorToken[]
}

/** Page / panel backgrounds used for “swatch on surface” matrices. */
export interface SurfaceBackground {
  id: string
  label: string
  cssVar: `--${string}`
  tailwind: string
}

export const SURFACE_BACKGROUNDS: SurfaceBackground[] = [
  { id: 'background', label: 'background', cssVar: '--background', tailwind: 'bg-background' },
  { id: 'sunken', label: 'sunken', cssVar: '--sunken', tailwind: 'bg-sunken' },
  { id: 'card', label: 'card', cssVar: '--card', tailwind: 'bg-card' },
  {
    id: 'surface-muted',
    label: 'surface-muted',
    cssVar: '--surface-muted',
    tailwind: 'bg-surface-muted',
  },
  { id: 'sidebar', label: 'sidebar', cssVar: '--sidebar', tailwind: 'bg-sidebar' },
]

/** Layer 1 elevation ladder steps for stacked Storybook preview. */
export const PALETTE_ELEVATION_LADDER_TOKENS: ColorToken[] = PALETTE_ELEVATION_LADDER.map(
  (step) => ({
    name: step,
    cssVar: `--palette-${step}`,
    tailwind: '(palette only)',
    usage: 'background' as const,
  }),
)

/** Orthogonal surface planes outside the elevation ladder. */
export const PALETTE_ORTHOGONAL_SURFACE_TOKENS: ColorToken[] = [
  'surface-secondary',
  'surface-accent',
].map((step) => ({
  name: step,
  cssVar: `--palette-${step}`,
  tailwind: '(palette only)',
  usage: 'background' as const,
}))

function palettePrimitiveUsage(step: string): ColorTokenUsage {
  if (step.startsWith('border-')) return 'border'
  if (step === 'neutral-hue') return 'background'
  if (step.startsWith('fg-') || step.includes('foreground') || step.startsWith('semantic-')) {
    return 'text'
  }
  return 'background'
}

/** Canvas would hide ink-on-solid samples — show on the plane each role is authored for. */
const PALETTE_TEXT_DEMO_SURFACES: Partial<Record<string, `--${string}`>> = {
  'fg-on-solid': '--palette-primary',
  'fg-on-status': '--palette-warning',
}

function palettePrimitiveToken(step: string): ColorToken {
  return {
    name: step,
    cssVar: `--palette-${step}`,
    tailwind: '(palette only)',
    usage: palettePrimitiveUsage(step),
    textDemoSurfaceVar: PALETTE_TEXT_DEMO_SURFACES[step],
  }
}

/** Layer 1 palette primitives — not Tailwind utilities; tune in `tokens/palette-*.css`. */
export const PALETTE_PRIMITIVE_TOKEN_GROUPS: ColorTokenGroup[] = PALETTE_PRIMITIVE_GROUPS.map(
  (group) => ({
    id: `palette-${group.id}`,
    label: `Palette · ${group.label}`,
    description: group.description,
    tokens:
      group.id === 'elevation'
        ? PALETTE_ORTHOGONAL_SURFACE_TOKENS
        : group.steps.map((step) => palettePrimitiveToken(step)),
  }),
)

export const COLOR_TOKEN_GROUPS: ColorTokenGroup[] = [
  {
    id: 'surfaces',
    label: 'Surfaces',
    description: 'Page planes, elevated cards, and popovers.',
    tokens: [
      {
        name: 'background',
        cssVar: '--background',
        tailwind: 'bg-background',
        usage: 'background',
        foregroundVar: '--foreground',
        foregroundTailwind: 'text-foreground',
      },
      {
        name: 'sidebar',
        cssVar: '--sidebar',
        tailwind: 'bg-sidebar',
        usage: 'background',
        foregroundVar: '--foreground',
        foregroundTailwind: 'text-foreground',
      },
      {
        name: 'foreground',
        cssVar: '--foreground',
        tailwind: 'text-foreground',
        usage: 'text',
      },
      {
        name: 'card',
        cssVar: '--card',
        tailwind: 'bg-card',
        usage: 'background',
        foregroundVar: '--card-foreground',
        foregroundTailwind: 'text-card-foreground',
      },
      {
        name: 'sunken',
        cssVar: '--sunken',
        tailwind: 'bg-sunken',
        usage: 'background',
        foregroundVar: '--foreground',
        foregroundTailwind: 'text-foreground',
      },
      {
        name: 'card-foreground',
        cssVar: '--card-foreground',
        tailwind: 'text-card-foreground',
        usage: 'text',
      },
      {
        name: 'popover',
        cssVar: '--popover',
        tailwind: 'bg-popover',
        usage: 'background',
        foregroundVar: '--popover-foreground',
        foregroundTailwind: 'text-popover-foreground',
      },
      {
        name: 'popover-foreground',
        cssVar: '--popover-foreground',
        tailwind: 'text-popover-foreground',
        usage: 'text',
      },
    ],
  },
  {
    id: 'brand',
    label: 'Brand & neutrals',
    tokens: [
      {
        name: 'primary',
        cssVar: '--primary',
        tailwind: 'bg-primary',
        usage: 'background',
        foregroundVar: '--primary-foreground',
        foregroundTailwind: 'text-primary-foreground',
      },
      {
        name: 'primary-foreground',
        cssVar: '--primary-foreground',
        tailwind: 'text-primary-foreground',
        usage: 'text',
      },
      {
        name: 'secondary',
        cssVar: '--secondary',
        tailwind: 'bg-secondary',
        usage: 'background',
        foregroundVar: '--secondary-foreground',
        foregroundTailwind: 'text-secondary-foreground',
      },
      {
        name: 'secondary-foreground',
        cssVar: '--secondary-foreground',
        tailwind: 'text-secondary-foreground',
        usage: 'text',
      },
      {
        name: 'muted',
        cssVar: '--muted',
        tailwind: 'bg-muted',
        usage: 'background',
        foregroundVar: '--muted-foreground',
        foregroundTailwind: 'text-muted-foreground',
      },
      {
        name: 'surface-faint',
        cssVar: '--surface-faint',
        tailwind: 'bg-surface-faint',
        usage: 'background',
      },
      {
        name: 'surface-subtle',
        cssVar: '--surface-subtle',
        tailwind: 'bg-surface-subtle',
        usage: 'background',
      },
      {
        name: 'surface-muted',
        cssVar: '--surface-muted',
        tailwind: 'bg-surface-muted',
        usage: 'background',
      },
      {
        name: 'surface-strong',
        cssVar: '--surface-strong',
        tailwind: 'bg-surface-strong',
        usage: 'background',
      },
      {
        name: 'muted-foreground',
        cssVar: '--muted-foreground',
        tailwind: 'text-muted-foreground',
        usage: 'text',
      },
      {
        name: 'accent',
        cssVar: '--accent',
        tailwind: 'bg-accent',
        usage: 'background',
        foregroundVar: '--accent-foreground',
        foregroundTailwind: 'text-accent-foreground',
      },
      {
        name: 'accent-foreground',
        cssVar: '--accent-foreground',
        tailwind: 'text-accent-foreground',
        usage: 'text',
      },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    description: 'Destructive, info, success, and warning tiers.',
    tokens: [
      {
        name: 'destructive',
        cssVar: '--destructive',
        tailwind: 'bg-destructive',
        usage: 'background',
        foregroundVar: '--destructive-foreground',
        foregroundTailwind: 'text-destructive-foreground',
      },
      {
        name: 'destructive-foreground',
        cssVar: '--destructive-foreground',
        tailwind: 'text-destructive-foreground',
        usage: 'text',
      },
      {
        name: 'destructive-muted',
        cssVar: '--destructive-muted',
        tailwind: 'border-destructive-muted',
        usage: 'border',
      },
      {
        name: 'destructive-subtle',
        cssVar: '--destructive-subtle',
        tailwind: 'bg-destructive-subtle',
        usage: 'background',
      },
      {
        name: 'info',
        cssVar: '--info',
        tailwind: 'bg-info',
        usage: 'background',
        foregroundVar: '--info-foreground',
        foregroundTailwind: 'text-info-foreground',
      },
      {
        name: 'info-foreground',
        cssVar: '--info-foreground',
        tailwind: 'text-info-foreground',
        usage: 'text',
      },
      {
        name: 'info-muted',
        cssVar: '--info-muted',
        tailwind: 'border-info-muted',
        usage: 'border',
      },
      {
        name: 'info-subtle',
        cssVar: '--info-subtle',
        tailwind: 'bg-info-subtle',
        usage: 'background',
      },
      {
        name: 'success',
        cssVar: '--success',
        tailwind: 'bg-success',
        usage: 'background',
        foregroundVar: '--success-foreground',
        foregroundTailwind: 'text-success-foreground',
      },
      {
        name: 'success-foreground',
        cssVar: '--success-foreground',
        tailwind: 'text-success-foreground',
        usage: 'text',
      },
      {
        name: 'success-muted',
        cssVar: '--success-muted',
        tailwind: 'border-success-muted',
        usage: 'border',
      },
      {
        name: 'success-subtle',
        cssVar: '--success-subtle',
        tailwind: 'bg-success-subtle',
        usage: 'background',
      },
      {
        name: 'warning',
        cssVar: '--warning',
        tailwind: 'bg-warning',
        usage: 'background',
        foregroundVar: '--warning-foreground',
        foregroundTailwind: 'text-warning-foreground',
      },
      {
        name: 'warning-foreground',
        cssVar: '--warning-foreground',
        tailwind: 'text-warning-foreground',
        usage: 'text',
      },
      {
        name: 'warning-muted',
        cssVar: '--warning-muted',
        tailwind: 'border-warning-muted',
        usage: 'border',
      },
      {
        name: 'warning-subtle',
        cssVar: '--warning-subtle',
        tailwind: 'bg-warning-subtle',
        usage: 'background',
      },
      {
        name: 'warning-faint',
        cssVar: '--warning-faint',
        tailwind: 'bg-warning-faint',
        usage: 'background',
      },
    ],
  },
  {
    id: 'chrome',
    label: 'Chrome',
    tokens: [
      { name: 'border', cssVar: '--border', tailwind: 'border-border', usage: 'border' },
      {
        name: 'border-faint',
        cssVar: '--border-faint',
        tailwind: 'border-border-faint',
        usage: 'border',
      },
      {
        name: 'border-subtle',
        cssVar: '--border-subtle',
        tailwind: 'border-border-subtle',
        usage: 'border',
      },
      {
        name: 'border-strong',
        cssVar: '--border-strong',
        tailwind: 'border-border-strong',
        usage: 'border',
      },
      {
        name: 'field-control-border',
        cssVar: '--field-control-border',
        tailwind: 'border-input',
        usage: 'border',
      },
      {
        name: 'field-control-bg',
        cssVar: '--field-control-bg',
        tailwind: 'bg-input',
        usage: 'background',
      },
      {
        name: 'field-control-border-invalid',
        cssVar: '--field-control-border-invalid',
        tailwind: 'border-input-invalid',
        usage: 'border',
      },
      {
        name: 'field-control-bg-invalid',
        cssVar: '--field-control-bg-invalid',
        tailwind: 'bg-input-invalid-subtle',
        usage: 'background',
      },
      {
        name: 'switch-track',
        cssVar: '--switch-track',
        tailwind: 'bg-switch-track',
        usage: 'background',
      },
      {
        name: 'switch-track-hover',
        cssVar: '--switch-track-hover',
        tailwind: 'bg-switch-track-hover',
        usage: 'background',
      },
      {
        name: 'switch-track-disabled',
        cssVar: '--switch-track-disabled',
        tailwind: 'bg-switch-track-disabled',
        usage: 'background',
      },
      { name: 'ring', cssVar: '--ring', tailwind: 'ring-ring', usage: 'border' },
      { name: 'overlay', cssVar: '--overlay', tailwind: 'bg-overlay', usage: 'background' },
      {
        name: 'card-selected-border',
        cssVar: '--card-selected-border',
        tailwind: 'border-card-selected-border',
        usage: 'border',
      },
    ],
  },
  {
    id: 'semantic-text',
    label: 'Semantic text',
    tokens: [
      {
        name: 'semantic-neutral',
        cssVar: '--semantic-neutral',
        tailwind: 'text-semantic-neutral',
        usage: 'text',
      },
      {
        name: 'semantic-info',
        cssVar: '--semantic-info',
        tailwind: 'text-semantic-info',
        usage: 'text',
      },
      {
        name: 'semantic-info-muted',
        cssVar: '--semantic-info-muted',
        tailwind: 'text-semantic-info-muted',
        usage: 'text',
      },
      {
        name: 'semantic-success',
        cssVar: '--semantic-success',
        tailwind: 'text-semantic-success',
        usage: 'text',
      },
      {
        name: 'semantic-warning',
        cssVar: '--semantic-warning',
        tailwind: 'text-semantic-warning',
        usage: 'text',
      },
      {
        name: 'semantic-destructive',
        cssVar: '--semantic-destructive',
        tailwind: 'text-semantic-destructive',
        usage: 'text',
      },
      {
        name: 'semantic-destructive-on-subtle',
        cssVar: '--semantic-destructive-on-subtle',
        tailwind: 'text-semantic-destructive-on-subtle',
        usage: 'text',
      },
    ],
  },
  {
    id: 'semantic-surface',
    label: 'Semantic surfaces',
    tokens: [
      {
        name: 'semantic-neutral-border',
        cssVar: '--semantic-neutral-border',
        tailwind: 'border-semantic-neutral-border',
        usage: 'border',
      },
      {
        name: 'semantic-neutral-subtle',
        cssVar: '--semantic-neutral-subtle',
        tailwind: 'bg-semantic-neutral-subtle',
        usage: 'background',
      },
      {
        name: 'semantic-info-border',
        cssVar: '--semantic-info-border',
        tailwind: 'border-semantic-info-border',
        usage: 'border',
      },
      {
        name: 'semantic-info-subtle',
        cssVar: '--semantic-info-subtle',
        tailwind: 'bg-semantic-info-subtle',
        usage: 'background',
      },
      {
        name: 'semantic-success-border',
        cssVar: '--semantic-success-border',
        tailwind: 'border-semantic-success-border',
        usage: 'border',
      },
      {
        name: 'semantic-success-subtle',
        cssVar: '--semantic-success-subtle',
        tailwind: 'bg-semantic-success-subtle',
        usage: 'background',
      },
      {
        name: 'semantic-warning-border',
        cssVar: '--semantic-warning-border',
        tailwind: 'border-semantic-warning-border',
        usage: 'border',
      },
      {
        name: 'semantic-warning-subtle',
        cssVar: '--semantic-warning-subtle',
        tailwind: 'bg-semantic-warning-subtle',
        usage: 'background',
      },
      {
        name: 'semantic-warning-accent-faint',
        cssVar: '--semantic-warning-accent-faint',
        tailwind: 'bg-semantic-warning-accent-faint',
        usage: 'background',
      },
      {
        name: 'semantic-destructive-border',
        cssVar: '--semantic-destructive-border',
        tailwind: 'border-semantic-destructive-border',
        usage: 'border',
      },
      {
        name: 'semantic-destructive-subtle',
        cssVar: '--semantic-destructive-subtle',
        tailwind: 'bg-semantic-destructive-subtle',
        usage: 'background',
      },
    ],
  },
  {
    id: 'interaction-recipes',
    label: 'Interaction recipes',
    description: 'Shared hover/selected/drag/track chrome — tune per theme at Layer 1.',
    tokens: [
      {
        name: 'control-hover-bg',
        cssVar: '--control-hover-bg',
        tailwind: 'bg-control-hover',
        usage: 'background',
      },
      {
        name: 'control-selected-bg',
        cssVar: '--control-selected-bg',
        tailwind: 'bg-control-selected',
        usage: 'background',
      },
      {
        name: 'row-hover-bg',
        cssVar: '--row-hover-bg',
        tailwind: 'bg-row-hover',
        usage: 'background',
      },
      {
        name: 'row-selected-bg',
        cssVar: '--row-selected-bg',
        tailwind: 'bg-row-selected',
        usage: 'background',
      },
      {
        name: 'row-selected-border',
        cssVar: '--row-selected-border',
        tailwind: 'border-row-selected-border',
        usage: 'border',
      },
      {
        name: 'drop-target-bg',
        cssVar: '--drop-target-bg',
        tailwind: 'bg-drop-target',
        usage: 'background',
      },
      {
        name: 'drop-target-border',
        cssVar: '--drop-target-border',
        tailwind: 'border-drop-target-border',
        usage: 'border',
      },
      {
        name: 'segmented-track-bg',
        cssVar: '--segmented-track-bg',
        tailwind: 'bg-segmented-track',
        usage: 'background',
      },
    ],
  },
  {
    id: 'control',
    label: 'Selected control',
    tokens: [
      {
        name: 'selected-control',
        cssVar: '--selected-control',
        tailwind: 'bg-selected-control',
        usage: 'background',
        foregroundVar: '--selected-control-foreground',
        foregroundTailwind: 'text-selected-control-foreground',
      },
      {
        name: 'selected-control-foreground',
        cssVar: '--selected-control-foreground',
        tailwind: 'text-selected-control-foreground',
        usage: 'text',
      },
      {
        name: 'selected-control-border',
        cssVar: '--selected-control-border',
        tailwind: 'border-selected-control-border',
        usage: 'border',
      },
    ],
  },
  {
    id: 'specialty',
    label: 'Specialty',
    tokens: [
      {
        name: 'catalog-picker-row-surface',
        cssVar: '--catalog-picker-row-surface',
        tailwind: 'bg-catalog-picker-row-surface',
        usage: 'background',
      },
    ],
  },
]

/** Tokens shown in on-surface matrices — fills and text hues commonly layered on panels. */
export const ON_SURFACE_TOKENS: ColorToken[] = [
  ...COLOR_TOKEN_GROUPS.find((group) => group.id === 'brand')!.tokens.filter(
    (token) => token.usage === 'background' || token.usage === 'text',
  ),
  ...COLOR_TOKEN_GROUPS.find((group) => group.id === 'status')!.tokens.filter(
    (token) => token.name.endsWith('-subtle') || token.usage === 'text',
  ),
  ...COLOR_TOKEN_GROUPS.find((group) => group.id === 'semantic-text')!.tokens,
  ...COLOR_TOKEN_GROUPS.find((group) => group.id === 'semantic-surface')!.tokens.filter(
    (token) => token.usage === 'background' || token.usage === 'border',
  ),
  COLOR_TOKEN_GROUPS.find((group) => group.id === 'specialty')!.tokens[0]!,
]
