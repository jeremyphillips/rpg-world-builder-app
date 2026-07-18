import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type { TextVariantProps } from './text.variants'

/** Recessed panel sizes — padding/radius plus default copy scale via `InsetPanel.Text`. */
export const INSET_PANEL_SIZES = ['sm', 'md', 'lg'] as const

export type InsetPanelSize = (typeof INSET_PANEL_SIZES)[number]

export const INSET_PANEL_SURFACES = ['none', 'muted', 'subtle', 'sunken'] as const

export type InsetPanelSurface = (typeof INSET_PANEL_SURFACES)[number]

export const INSET_PANEL_BORDER_STYLES = ['solid', 'dashed'] as const

export type InsetPanelBorderStyle = (typeof INSET_PANEL_BORDER_STYLES)[number]

export const INSET_PANEL_ALIGNS = ['start', 'center'] as const

export type InsetPanelAlign = (typeof INSET_PANEL_ALIGNS)[number]

/** Subtle recess emboss for sunken inset panels — inner shadow + edge shade. */
export const insetPanelSunkenShadowClasses = 'shadow-surface-sunken'

const insetPanelSurfaceClasses = {
  none: '',
  muted: 'bg-surface-muted',
  subtle: 'bg-surface-subtle',
  sunken: cn('bg-sunken', insetPanelSunkenShadowClasses),
} satisfies Record<InsetPanelSurface, string>

const insetPanelSizeClasses = {
  sm: 'rounded-md p-3',
  md: 'rounded-md p-4',
  lg: 'rounded-lg p-8',
} satisfies Record<InsetPanelSize, string>

/** Default `Text` variant for each inset panel size. */
export const insetPanelTextVariantBySize = {
  sm: 'caption',
  md: 'small',
  lg: 'muted',
} satisfies Record<InsetPanelSize, NonNullable<TextVariantProps['variant']>>

export function resolveInsetPanelTextVariant(
  size: InsetPanelSize,
  variant?: TextVariantProps['variant'],
): NonNullable<TextVariantProps['variant']> {
  return variant ?? insetPanelTextVariantBySize[size]
}

export const insetPanelVariants = cva('min-w-0 border border-border', {
  variants: {
    surface: insetPanelSurfaceClasses,
    borderStyle: {
      solid: '',
      dashed: 'border-dashed',
    },
    size: insetPanelSizeClasses,
    align: {
      start: '',
      center: 'text-center',
    },
  },
  defaultVariants: {
    surface: 'sunken',
    borderStyle: 'solid',
    size: 'md',
    align: 'start',
  },
})

export type InsetPanelVariantProps = VariantProps<typeof insetPanelVariants>

/** Dashed placeholder chrome shared by catalog pickers and similar empty views. */
export const insetPanelEmptyStateClasses = insetPanelVariants({
  borderStyle: 'dashed',
  surface: 'none',
  size: 'md',
  align: 'center',
})

/** Dashed recessed gate chrome for authoring blockers. */
export const insetPanelGateClasses = insetPanelVariants({
  borderStyle: 'dashed',
  surface: 'sunken',
  size: 'lg',
  align: 'center',
})

/** @deprecated Use `insetPanelEmptyStateClasses` — kept for cva-style call sites. */
export const insetPanelEmptyStateVariants = () => insetPanelEmptyStateClasses

/** @deprecated Use `insetPanelGateClasses`. */
export const insetPanelGateVariants = () => insetPanelGateClasses
