import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { resolveSurfaceClasses } from './surface.variants'
import type { TextVariantProps } from './text.variants'
import type { SurfaceConfig } from './visual-vocabulary.types'

/** Recessed panel sizes — padding/radius plus default copy scale via `InsetPanel.Text`. */
export const INSET_PANEL_SIZES = ['sm', 'md', 'lg'] as const

export type InsetPanelSize = (typeof INSET_PANEL_SIZES)[number]

export const INSET_PANEL_BORDER_STYLES = ['solid', 'dashed'] as const

export type InsetPanelBorderStyle = (typeof INSET_PANEL_BORDER_STYLES)[number]

export const INSET_PANEL_ALIGNS = ['start', 'center'] as const

export type InsetPanelAlign = (typeof INSET_PANEL_ALIGNS)[number]

/** Default recessed inset panel surface. */
export const DEFAULT_INSET_PANEL_SURFACE: SurfaceConfig = { elevation: 'sunken' }

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

export function resolveInsetPanelSurfaceClasses(surface?: SurfaceConfig): string {
  if (!surface) {
    return resolveSurfaceClasses(DEFAULT_INSET_PANEL_SURFACE)
  }

  if (
    surface.emphasis === undefined &&
    surface.elevation === undefined &&
    Object.keys(surface).length === 0
  ) {
    return ''
  }

  return resolveSurfaceClasses(surface)
}

export const insetPanelVariants = cva('min-w-0 border border-border', {
  variants: {
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
    borderStyle: 'solid',
    size: 'md',
    align: 'start',
  },
})

export type InsetPanelVariantProps = VariantProps<typeof insetPanelVariants> & {
  surface?: SurfaceConfig
}

export function insetPanelClassNames({
  surface,
  borderStyle,
  size = 'md',
  align,
  className,
}: InsetPanelVariantProps & { className?: string }): string {
  return cn(
    insetPanelVariants({ borderStyle, size, align }),
    resolveInsetPanelSurfaceClasses(surface),
    className,
  )
}

/** Dashed placeholder chrome shared by catalog pickers and similar empty views. */
export const insetPanelEmptyStateClasses = insetPanelClassNames({
  borderStyle: 'dashed',
  surface: {},
  size: 'md',
  align: 'center',
})

/** Dashed recessed gate chrome for authoring blockers. */
export const insetPanelGateClasses = insetPanelClassNames({
  borderStyle: 'dashed',
  surface: DEFAULT_INSET_PANEL_SURFACE,
  size: 'lg',
  align: 'center',
})

/** @deprecated Use `insetPanelEmptyStateClasses` — kept for cva-style call sites. */
export const insetPanelEmptyStateVariants = () => insetPanelEmptyStateClasses

/** @deprecated Use `insetPanelGateClasses`. */
export const insetPanelGateVariants = () => insetPanelGateClasses

export { insetPanelSunkenShadowClasses } from './field-surface.lib'
