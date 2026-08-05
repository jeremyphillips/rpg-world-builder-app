import { cn } from '../../lib/utils'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'

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
  iconGlyphDescendantClasses.sm,
)

/** Default icon-button — 36px hit target + lg (16px) glyph */
export const controlActionDefaultIconClasses = cn(
  controlActionDefaultSizeClasses,
  iconGlyphDescendantClasses.lg,
)
