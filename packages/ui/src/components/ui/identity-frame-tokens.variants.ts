import { cn } from '../../lib/utils'
import { iconGlyphDirectChildClasses } from './icon-glyph.variants'

export const IDENTITY_FRAME_SIZES = ['xs', 'sm', 'md', 'inline'] as const
export type IdentityFrameSize = (typeof IDENTITY_FRAME_SIZES)[number]

export const IDENTITY_FRAME_SHAPES = ['box', 'circle'] as const
export type IdentityFrameShape = (typeof IDENTITY_FRAME_SHAPES)[number]

export const IDENTITY_FRAME_FITS = ['cover', 'contain'] as const
export type IdentityFrameFit = (typeof IDENTITY_FRAME_FITS)[number]

export const identityFrameSizeClasses: Record<IdentityFrameSize, string> = {
  xs: 'size-8',
  sm: 'size-10',
  md: 'size-[3.75rem]',
  inline: 'size-5',
}

export const identityFrameShapeClasses: Record<IdentityFrameShape, string> = {
  box: 'rounded-md',
  circle: 'rounded-full',
}

/** Icon glyph sizing for fallback icons inside a frame at each density. */
export const identityFrameFallbackIconClasses: Record<IdentityFrameSize, string> = {
  xs: iconGlyphDirectChildClasses.sm,
  sm: iconGlyphDirectChildClasses.lg,
  md: cn('[&>svg]:size-6'),
  inline: iconGlyphDirectChildClasses.xs,
}

export const identityFrameFitClasses: Record<IdentityFrameFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
}
