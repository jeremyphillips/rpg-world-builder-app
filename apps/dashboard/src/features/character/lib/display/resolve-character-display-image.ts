import {
  resolveCharacterDisplayImageAsOptional,
  type Character,
  type ContentDisplayImage,
  type ContentDisplaySurface,
} from '@rpg/contracts'

import { mediaImageUrl, MEDIA_SOURCE_CROP } from '@/features/media/lib/media-display'

export function resolveCharacterDisplayImageForSurface(
  character: Pick<Character, 'media'>,
  surface: ContentDisplaySurface = 'compact',
): ContentDisplayImage | undefined {
  return resolveCharacterDisplayImageAsOptional({
    media: character.media,
    surface,
    resolveUploadSrc: (assetId) => mediaImageUrl(assetId, 'artwork', MEDIA_SOURCE_CROP),
  })
}

/** @deprecated Use {@link resolveCharacterDisplayImageForSurface}. */
export const resolveCharacterPrimaryDisplayImage = resolveCharacterDisplayImageForSurface
