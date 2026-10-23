export const ICON_GLYPH_STEPS = ['xs', 'sm', 'md', 'lg', '3xl'] as const
export type IconGlyphStep = (typeof ICON_GLYPH_STEPS)[number]

/** For wrappers that contain an svg child */
export const iconGlyphDescendantClasses: Record<IconGlyphStep, string> = {
  xs: '[&_svg]:size-icon-glyph-xs',
  sm: '[&_svg]:size-icon-glyph-sm',
  md: '[&_svg]:size-icon-glyph-md',
  lg: '[&_svg]:size-icon-glyph-lg',
  '3xl': '[&_svg]:size-icon-glyph-3xl',
}

/** Direct-child svg wrappers (e.g. SemanticText icon slot) */
export const iconGlyphDirectChildClasses: Record<IconGlyphStep, string> = {
  xs: '[&>svg]:size-icon-glyph-xs',
  sm: '[&>svg]:size-icon-glyph-sm',
  md: '[&>svg]:size-icon-glyph-md',
  lg: '[&>svg]:size-icon-glyph-lg',
  '3xl': '[&>svg]:size-icon-glyph-3xl',
}

/** Preferred export — pick root vs descendant at call site */
export const iconGlyphSizeClasses = iconGlyphDescendantClasses

/** Icon in inline flow. Size comes from the nearest typography owner's --icon-inline. */
export const inlineIconTextClasses = 'inline-block shrink-0 align-middle size-icon-inline'
