export const IDENTITY_FRAME_SIZES = ['xs', 'sm', 'md', 'inline'] as const
export type IdentityFrameSize = (typeof IDENTITY_FRAME_SIZES)[number]

export const IDENTITY_FRAME_SHAPES = ['box', 'circle'] as const
export type IdentityFrameShape = (typeof IDENTITY_FRAME_SHAPES)[number]

export const IDENTITY_FRAME_FITS = ['cover', 'contain'] as const
export type IdentityFrameFit = (typeof IDENTITY_FRAME_FITS)[number]

export const identityFrameSizeClasses: Record<IdentityFrameSize, string> = {
  xs: 'ui-identity-frame--xs',
  sm: 'ui-identity-frame--sm',
  md: 'ui-identity-frame--md',
  inline: 'ui-identity-frame--inline',
}

export const identityFrameShapeClasses: Record<IdentityFrameShape, string> = {
  box: 'ui-identity-frame--shape-box',
  circle: 'ui-identity-frame--shape-circle',
}

export const identityFrameFitClasses: Record<IdentityFrameFit, string> = {
  cover: 'ui-identity-frame__image--cover',
  contain: 'ui-identity-frame__image--contain',
}
