import { cn } from '../../lib/utils'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'

/** Icon–label flex gap for labeled control-action tiers (standard Tailwind spacing). */
export const CONTROL_ACTION_GAP_CLASSES = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
} as const

export type ControlActionMetricsTier = keyof typeof CONTROL_ACTION_GAP_CLASSES

/** Compact inline action height — 24px (`--control-action-compact-height`) */
export const controlActionCompactHeightClasses = 'h-control-action-compact'

/** Compact inline action square hit target — 24px */
export const controlActionCompactSizeClasses = 'size-control-action-compact'

/** Default icon-button square hit target — 36px */
export const controlActionDefaultSizeClasses = 'size-control-action-default'

/** Large icon-button square hit target — 40px */
export const controlActionLgSizeClasses = 'size-control-action-lg'

/**
 * Compact icon control — locked pairing: 24px hit target + md (14px) glyph.
 * Use for ContentCard icon actions, collapsible chrome, chip remove md, Button icon+compact.
 */
export const controlActionCompactIconClasses = cn(
  controlActionCompactSizeClasses,
  iconGlyphDescendantClasses.md,
)

/** Compact text action — height only, no glyph sizing */
export const controlActionCompactTextClasses = controlActionCompactHeightClasses

/** Compact text+icon action — compact height + sm glyph */
export const controlActionCompactTextWithIconClasses = cn(
  controlActionCompactHeightClasses,
  CONTROL_ACTION_GAP_CLASSES.xs,
  iconGlyphDescendantClasses.sm,
)

/** Default icon-button — 36px hit target + lg (16px) glyph */
export const controlActionDefaultIconClasses = cn(
  controlActionDefaultSizeClasses,
  iconGlyphDescendantClasses.lg,
)

/** Large icon-button — 40px hit target + lg (16px) glyph; pairs with Button `size="icon-lg"`. */
export const controlActionLgIconClasses = cn(
  controlActionLgSizeClasses,
  iconGlyphDescendantClasses.lg,
)

/** Dense labeled control — 28px height + 10px type; pairs with Button `size="xs"` default density. */
export const controlActionXsTextClasses = cn(
  'h-control-action-xs px-2.5 text-control-action-xs',
  CONTROL_ACTION_GAP_CLASSES.xs,
  iconGlyphDescendantClasses.xs,
)

/** Dense labeled control — 24px height + 10px type + xs glyph; Button `size="xs"` compact density. */
export const controlActionXsCompactTextWithIconClasses = cn(
  controlActionCompactHeightClasses,
  'px-2 py-0 text-control-action-xs',
  CONTROL_ACTION_GAP_CLASSES.xs,
  iconGlyphDescendantClasses.xs,
)

/** Text-only compact xs control — 24px height + 10px type; Button `variant="text"` `size="xs"` compact. */
export const controlActionXsCompactTextOnlyClasses = cn(
  controlActionCompactHeightClasses,
  'px-0 text-control-action-xs',
)

/** Smallest icon control — 24px hit target + xs (10px) glyph; Button `size="icon-xs"` (density-independent). */
export const controlActionXsIconClasses = cn(
  controlActionCompactSizeClasses,
  iconGlyphDescendantClasses.xs,
)
