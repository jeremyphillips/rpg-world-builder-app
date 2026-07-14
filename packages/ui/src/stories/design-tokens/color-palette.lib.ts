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
  { id: 'card', label: 'card', cssVar: '--card', tailwind: 'bg-card' },
  { id: 'muted', label: 'muted', cssVar: '--muted', tailwind: 'bg-muted' },
  { id: 'accent', label: 'accent', cssVar: '--accent', tailwind: 'bg-accent' },
  { id: 'primary', label: 'primary', cssVar: '--primary', tailwind: 'bg-primary' },
  {
    id: 'destructive-subtle',
    label: 'destructive-subtle',
    cssVar: '--destructive-subtle',
    tailwind: 'bg-destructive-subtle',
  },
]

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
    ],
  },
  {
    id: 'chrome',
    label: 'Chrome',
    tokens: [
      { name: 'border', cssVar: '--border', tailwind: 'border-border', usage: 'border' },
      { name: 'input', cssVar: '--input', tailwind: 'border-input', usage: 'border' },
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
        name: 'semantic-informative',
        cssVar: '--semantic-informative',
        tailwind: 'text-semantic-informative',
        usage: 'text',
      },
      {
        name: 'semantic-informative-muted',
        cssVar: '--semantic-informative-muted',
        tailwind: 'text-semantic-informative-muted',
        usage: 'text',
      },
      {
        name: 'semantic-positive',
        cssVar: '--semantic-positive',
        tailwind: 'text-semantic-positive',
        usage: 'text',
      },
      {
        name: 'semantic-caution',
        cssVar: '--semantic-caution',
        tailwind: 'text-semantic-caution',
        usage: 'text',
      },
      {
        name: 'semantic-negative',
        cssVar: '--semantic-negative',
        tailwind: 'text-semantic-negative',
        usage: 'text',
      },
      {
        name: 'semantic-negative-on-subtle',
        cssVar: '--semantic-negative-on-subtle',
        tailwind: 'text-semantic-negative-on-subtle',
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
        name: 'semantic-informative-border',
        cssVar: '--semantic-informative-border',
        tailwind: 'border-semantic-informative-border',
        usage: 'border',
      },
      {
        name: 'semantic-informative-subtle',
        cssVar: '--semantic-informative-subtle',
        tailwind: 'bg-semantic-informative-subtle',
        usage: 'background',
      },
      {
        name: 'semantic-positive-border',
        cssVar: '--semantic-positive-border',
        tailwind: 'border-semantic-positive-border',
        usage: 'border',
      },
      {
        name: 'semantic-positive-subtle',
        cssVar: '--semantic-positive-subtle',
        tailwind: 'bg-semantic-positive-subtle',
        usage: 'background',
      },
      {
        name: 'semantic-caution-border',
        cssVar: '--semantic-caution-border',
        tailwind: 'border-semantic-caution-border',
        usage: 'border',
      },
      {
        name: 'semantic-caution-subtle',
        cssVar: '--semantic-caution-subtle',
        tailwind: 'bg-semantic-caution-subtle',
        usage: 'background',
      },
      {
        name: 'semantic-negative-border',
        cssVar: '--semantic-negative-border',
        tailwind: 'border-semantic-negative-border',
        usage: 'border',
      },
      {
        name: 'semantic-negative-subtle',
        cssVar: '--semantic-negative-subtle',
        tailwind: 'bg-semantic-negative-subtle',
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
