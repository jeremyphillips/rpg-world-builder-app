import { cn } from '../../lib/utils'

export const ICON_GLYPH_STEPS = ['xs', 'sm', 'md', 'lg'] as const
export type IconGlyphStep = (typeof ICON_GLYPH_STEPS)[number]

/** CSS utilities: size-icon-glyph-{step} — backed by --icon-glyph-{step} in globals.css */
export const iconGlyphRootClasses: Record<IconGlyphStep, string> = {
  xs: 'size-icon-glyph-xs',
  sm: 'size-icon-glyph-sm',
  md: 'size-icon-glyph-md',
  lg: 'size-icon-glyph-lg',
}

/** For wrappers that contain an svg child */
export const iconGlyphDescendantClasses: Record<IconGlyphStep, string> = {
  xs: '[&_svg]:size-icon-glyph-xs',
  sm: '[&_svg]:size-icon-glyph-sm',
  md: '[&_svg]:size-icon-glyph-md',
  lg: '[&_svg]:size-icon-glyph-lg',
}

/** Direct-child svg wrappers (e.g. SemanticText icon slot) */
export const iconGlyphDirectChildClasses: Record<IconGlyphStep, string> = {
  xs: '[&>svg]:size-icon-glyph-xs',
  sm: '[&>svg]:size-icon-glyph-sm',
  md: '[&>svg]:size-icon-glyph-md',
  lg: '[&>svg]:size-icon-glyph-lg',
}

/** Preferred export — pick root vs descendant at call site */
export const iconGlyphSizeClasses = iconGlyphDescendantClasses

/** Menu row icons — glyph lg only, no hit target */
export const menuItemIconGlyphClasses = iconGlyphDescendantClasses.lg

/** Compact label / badge leading icon slot */
export function compactLabelIconGlyphClasses(size: 'sm' | 'md' | 'lg'): string {
  const step: IconGlyphStep = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'
  return iconGlyphDescendantClasses[step]
}

/** Chip selectable leading check — root Lucide class */
export function chipLeadingIconGlyphClasses(size: 'sm' | 'md' | 'lg'): string {
  const step: IconGlyphStep = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'
  return iconGlyphRootClasses[step]
}

/** Badge icon slot wrapper */
export function badgeIconGlyphClasses(size: 'sm' | 'md' | 'lg'): string {
  return cn('inline-flex shrink-0 leading-none', compactLabelIconGlyphClasses(size))
}
