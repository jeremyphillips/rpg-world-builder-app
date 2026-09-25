export type ContentImagePresentationSurface = 'primary' | 'builderCard' | 'thumbnail'

export type ContentImageObjectPresentation = {
  objectFit: 'cover' | 'contain'
  objectPosition: string
}

export const CONTENT_IMAGE_PRESENTATION_DEFAULTS = {
  primary: {
    objectFit: 'cover',
    objectPosition: '50% 20%',
  },
  builderCard: {
    objectFit: 'cover',
    objectPosition: '50% 14%',
  },
  thumbnail: {
    objectFit: 'cover',
    objectPosition: '50% 18%',
  },
} as const satisfies Record<ContentImagePresentationSurface, ContentImageObjectPresentation>

export function resolveContentImagePresentationDefault(
  surface: ContentImagePresentationSurface,
): ContentImageObjectPresentation {
  return CONTENT_IMAGE_PRESENTATION_DEFAULTS[surface]
}
